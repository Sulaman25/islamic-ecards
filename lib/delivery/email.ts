import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendCardEmailParams {
  to: string;
  recipientName: string;
  senderName: string;
  occasionTitle: string;
  message: string;
  verseTextEn?: string;
  viewToken: string;
  cardBgColor?: string;
}

export async function sendCardEmail(params: SendCardEmailParams) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/view/${params.viewToken}`;

  const { data, error } = await resend.emails.send({
    from: `Islamic Ecards <onboarding@${process.env.RESEND_DOMAIN ?? "resend.dev"}>`,
    to: params.to,
    subject: `${params.senderName} sent you an Islamic card for ${params.occasionTitle}`,
    html: buildEmailHtml({ ...params, viewUrl }),
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}

function buildEmailHtml(
  params: SendCardEmailParams & { viewUrl: string }
): string {
  return `<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Islamic Ecard</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:${params.cardBgColor ?? "#1a3a2a"};padding:40px;text-align:center;">
              <h1 style="color:#d4af37;font-family:'Amiri',Georgia,serif;font-size:28px;margin:0;">بسم الله الرحمن الرحيم</h1>
              <p style="color:#e8d5b0;font-size:14px;margin:8px 0 0;">In the name of Allah, the Most Gracious, the Most Merciful</p>
            </td>
          </tr>
          <!-- Card Info -->
          <tr>
            <td style="padding:32px 40px;text-align:center;border-bottom:1px solid #f0ebe0;">
              <p style="color:#7a6a50;font-size:14px;margin:0 0 8px;">A card for ${params.occasionTitle}</p>
              <h2 style="color:#2d1b0e;font-size:22px;margin:0;">Dear ${params.recipientName},</h2>
            </td>
          </tr>
          <!-- Message -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="color:#3d2b1a;font-size:18px;line-height:1.8;font-style:italic;font-family:'Amiri',Georgia,serif;">"${params.message}"</p>
              ${
                params.verseTextEn
                  ? `<p style="color:#7a6a50;font-size:14px;margin-top:20px;padding-top:20px;border-top:1px solid #f0ebe0;font-style:italic;">${params.verseTextEn}</p>`
                  : ""
              }
            </td>
          </tr>
          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${params.viewUrl}" style="display:inline-block;background-color:#c9a84c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">
                Open Your Card
              </a>
            </td>
          </tr>
          <!-- Sender -->
          <tr>
            <td style="padding:20px 40px;text-align:center;background-color:#faf8f3;border-top:1px solid #f0ebe0;">
              <p style="color:#7a6a50;font-size:14px;margin:0;">Sent with love by <strong>${params.senderName}</strong></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px;text-align:center;background-color:#2d1b0e;">
              <p style="color:#8a7a6a;font-size:12px;margin:0;">Islamic Ecards — Spread Blessings</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
