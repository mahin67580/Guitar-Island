export function buildOrderWhatsAppMessage(
  orderNumber: string,
  customerName: string,
  total: number,
  itemCount: number
): string {
  const lines = [
    `Hi Guitar Island! 👋`,
    ``,
    `I just placed an order on your website.`,
    ``,
    `📦 Order: *${orderNumber}*`,
    `👤 Name: ${customerName}`,
    `🛍️ Items: ${itemCount}`,
    `💰 Total: ৳${total.toLocaleString()}`,
    ``,
    `Please confirm my order. Thanks!`,
  ];
  return lines.join("\n");
}

export function buildOrderWhatsAppUrl(
  whatsappNumber: string,
  orderNumber: string,
  customerName: string,
  total: number,
  itemCount: number
): string {
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const message = buildOrderWhatsAppMessage(
    orderNumber,
    customerName,
    total,
    itemCount
  );
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}