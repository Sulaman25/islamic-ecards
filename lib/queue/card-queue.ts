import { Queue } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@/lib/db/prisma";

export const QUEUE_NAME = "card-delivery";

export interface CardDeliveryJob {
  cardId: string;
  channel: "EMAIL" | "WHATSAPP" | "SMS";
}

export function createRedisConnection(): IORedis {
  return new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

let _queue: Queue<CardDeliveryJob> | null = null;

export function getCardQueue(): Queue<CardDeliveryJob> {
  if (!_queue) {
    _queue = new Queue<CardDeliveryJob>(QUEUE_NAME, {
      connection: createRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: 200,
        removeOnFail: 500,
      },
    });
  }
  return _queue;
}

export async function enqueueCardDelivery(
  cardId: string,
  channel: CardDeliveryJob["channel"],
  runAt?: Date
): Promise<string> {
  const delayMs = runAt ? Math.max(0, runAt.getTime() - Date.now()) : 0;
  const job = await getCardQueue().add("deliver", { cardId, channel }, { delay: delayMs });
  if (!job.id) throw new Error("BullMQ returned job without an ID");
  return job.id;
}

/**
 * Create a scheduled SentCard record and enqueue its delivery job.
 * Falls back to status "PENDING" (cron fallback) if Redis is unavailable.
 * Returns the created card's viewToken.
 */
export async function scheduleCardDelivery(
  cardData: Parameters<typeof prisma.sentCard.create>[0]["data"],
  scheduledDate: Date
): Promise<string> {
  const sentCard = await prisma.sentCard.create({
    data: { ...cardData, status: "SCHEDULED", scheduledAt: scheduledDate },
  });

  try {
    const jobId = await enqueueCardDelivery(sentCard.id, cardData.channel as CardDeliveryJob["channel"], scheduledDate);
    await prisma.sentCard.update({ where: { id: sentCard.id }, data: { deliveryJobId: jobId } });
  } catch {
    // Redis unavailable — cron route picks up SCHEDULED cards as fallback
    await prisma.sentCard.update({ where: { id: sentCard.id }, data: { status: "PENDING" } });
  }

  return sentCard.viewToken;
}
