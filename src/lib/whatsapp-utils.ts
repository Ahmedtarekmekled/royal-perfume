interface OrderData {
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
  };
  total: number;
  currency: string;
  orderNumber: string;
}

export function redirectToWhatsApp(orderData: OrderData) {
  const { customer, total, currency } = orderData;
  
  const message = `Hello, I have placed an order with Royal Perfumes.
Please find the PDF invoice attached.

Customer: ${customer.name}
Phone: ${customer.phone}
City: ${customer.city}
Total: ${total.toFixed(2)} ${currency}

Thank you!`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = '905541869905';
  const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  
  // Open WhatsApp in a new window
  window.open(url, '_blank');
}
