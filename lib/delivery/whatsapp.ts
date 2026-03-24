interface WhatsAppShareParams {
  viewToken: string;
  senderName: string;
  recipientName: string;
  occasionTitle: string;
}

export function generateWhatsAppShareUrl(
  params: WhatsAppShareParams
): string {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/view/${params.viewToken}`;
  const message = `السلام عليكم ${params.recipientName}! 🌙\n\n${params.senderName} has sent you an Islamic ecard for ${params.occasionTitle}.\n\nOpen your card: ${viewUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
