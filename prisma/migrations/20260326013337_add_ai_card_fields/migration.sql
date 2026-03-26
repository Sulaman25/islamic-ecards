-- AlterTable
ALTER TABLE "CardTemplate" ADD COLUMN     "accentCss" TEXT,
ADD COLUMN     "accentJs" TEXT,
ADD COLUMN     "animationStyle" TEXT,
ADD COLUMN     "generatedAt" TIMESTAMP(3),
ADD COLUMN     "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mood" TEXT,
ADD COLUMN     "publishAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "shapeSvg" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'published';
