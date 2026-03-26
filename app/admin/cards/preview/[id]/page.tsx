// app/admin/cards/preview/[id]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCardPreview({ params }: PageProps) {
  const { id } = await params;

  const card = await prisma.cardTemplate.findUnique({
    where:   { id },
    include: { occasion: true },
  });

  if (!card) notFound();

  const statusColour =
    card.status === 'published'      ? '#16a34a' :
    card.status === 'pending_review' ? '#d97706' : '#dc2626';

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '4px' }}>Card Preview</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>{card.titleEn}</p>

      {/* Status badge */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ background: statusColour, color: '#fff', borderRadius: '999px', padding: '4px 12px', fontSize: '0.82rem' }}>
          {card.status}
        </span>
        {card.publishAt && card.status === 'pending_review' && (
          <span style={{ marginLeft: '12px', color: '#888', fontSize: '0.85rem' }}>
            Auto-publishes at {card.publishAt.toUTCString()}
          </span>
        )}
      </div>

      {/* Card preview — accent code runs in an iframe for sandboxing */}
      <iframe
        srcDoc={buildCardPreviewDoc(card)}
        style={{ width: '320px', height: '440px', border: 'none', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        sandbox="allow-scripts"
        title="Card preview"
      />

      {/* Card details */}
      <table style={{ marginTop: '24px', borderCollapse: 'collapse', width: '100%' }}>
        {[
          ['Occasion',   card.occasion?.nameEn ?? '—'],
          ['Mood',       card.mood ?? '—'],
          ['Animation',  card.animationStyle ?? '—'],
          ['Shape',      card.shapeSvg ? 'custom SVG' : '—'],
          ['AI card',    card.isAiGenerated ? 'Yes' : 'No'],
          ['Created',    card.createdAt.toUTCString()],
        ].map(([label, value]) => (
          <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', color: '#888', width: '140px' }}>{label}</td>
            <td style={{ padding: '8px' }}>{value}</td>
          </tr>
        ))}
      </table>

      {/* Reject button — only shown for pending cards */}
      {card.status === 'pending_review' && (
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <a
            href={`/api/agents/reject-card?id=${card.id}&token=SIGN_IN_TO_REJECT`}
            style={{ padding: '10px 24px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}
          >
            Reject Card
          </a>
          <span style={{ color: '#888', fontSize: '0.82rem', alignSelf: 'center' }}>
            (Use the reject link from the notification email — it includes the auth token)
          </span>
        </div>
      )}
    </div>
  );
}

function buildCardPreviewDoc(card: {
  bgColor:       string;
  accentCss:     string | null;
  accentJs:      string | null;
  shapeSvg:      string | null;
  animationStyle?: string | null;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin: 0; width: 320px; height: 440px; overflow: hidden; }
  .card-root {
    width: 100%; height: 100%;
    background: ${card.bgColor};
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  ${card.accentCss ?? ''}
</style>
</head>
<body>
  ${card.shapeSvg ?? ''}
  <div class="card-root">
    <div class="accent-container"></div>
  </div>
  ${card.accentJs ? `<script>${card.accentJs}</script>` : ''}
</body>
</html>`;
}
