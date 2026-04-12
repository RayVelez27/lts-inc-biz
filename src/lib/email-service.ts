// Email Service - Simulates email sending for demo purposes
// In production, integrate with SendGrid, AWS SES, or similar

export interface EmailTemplate {
  id: string;
  subject: string;
  to: string;
  type: "order_confirmation" | "shipping_update" | "review_request" | "newsletter" | "password_reset";
  data: OrderEmailData | Record<string, unknown>;
  sentAt: string;
  status: "sent" | "pending" | "failed";
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totals: {
    subtotal: number;
    discount: number;
    embroidery: number;
    shipping: number;
    total: number;
  };
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  estimatedDelivery: string;
}

// Store sent emails in localStorage for demo
function getEmails(): EmailTemplate[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("lts-emails") || "[]");
}

function saveEmail(email: EmailTemplate): void {
  if (typeof window === "undefined") return;
  const emails = getEmails();
  emails.push(email);
  localStorage.setItem("lts-emails", JSON.stringify(emails));
}

export function sendOrderConfirmationEmail(data: OrderEmailData): EmailTemplate {
  const email: EmailTemplate = {
    id: `email-${Date.now()}`,
    subject: `Order Confirmation - ${data.orderId}`,
    to: data.customerEmail,
    type: "order_confirmation",
    data,
    sentAt: new Date().toISOString(),
    status: "sent",
  };

  saveEmail(email);

  // In production, this would call an email API
  console.log("📧 Order confirmation email sent to:", data.customerEmail);

  return email;
}

export function sendShippingUpdateEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  trackingNumber: string,
  carrier: string
): EmailTemplate {
  const email: EmailTemplate = {
    id: `email-${Date.now()}`,
    subject: `Your Order ${orderId} Has Shipped!`,
    to: customerEmail,
    type: "shipping_update",
    data: {
      orderId,
      customerName,
      trackingNumber,
      carrier,
    },
    sentAt: new Date().toISOString(),
    status: "sent",
  };

  saveEmail(email);
  console.log("📧 Shipping update email sent to:", customerEmail);

  return email;
}

export function sendReviewRequestEmail(
  orderId: string,
  customerEmail: string,
  customerName: string,
  productNames: string[]
): EmailTemplate {
  const email: EmailTemplate = {
    id: `email-${Date.now()}`,
    subject: "How did we do? Leave a review!",
    to: customerEmail,
    type: "review_request",
    data: {
      orderId,
      customerName,
      productNames,
    },
    sentAt: new Date().toISOString(),
    status: "sent",
  };

  saveEmail(email);
  console.log("📧 Review request email sent to:", customerEmail);

  return email;
}

export function sendPasswordResetEmail(
  email: string,
  resetToken: string
): EmailTemplate {
  const emailRecord: EmailTemplate = {
    id: `email-${Date.now()}`,
    subject: "Reset Your Password - LT's Business",
    to: email,
    type: "password_reset",
    data: {
      resetToken,
      resetLink: `https://ltsbusiness.com/reset-password?token=${resetToken}`,
    },
    sentAt: new Date().toISOString(),
    status: "sent",
  };

  saveEmail(emailRecord);
  console.log("📧 Password reset email sent to:", email);

  return emailRecord;
}

export function sendNewsletterEmail(
  email: string,
  subject: string,
  content: string
): EmailTemplate {
  const emailRecord: EmailTemplate = {
    id: `email-${Date.now()}`,
    subject,
    to: email,
    type: "newsletter",
    data: {
      content,
    },
    sentAt: new Date().toISOString(),
    status: "sent",
  };

  saveEmail(emailRecord);
  console.log("📧 Newsletter email sent to:", email);

  return emailRecord;
}

export function getSentEmails(): EmailTemplate[] {
  return getEmails();
}

export function getEmailsByType(type: EmailTemplate["type"]): EmailTemplate[] {
  return getEmails().filter((e) => e.type === type);
}

// Generate HTML email template (for preview)
export function generateOrderConfirmationHTML(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Kanit', Arial, sans-serif; background: #f5f2ed; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #1a3a5c; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .order-number { background: #f5f2ed; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .order-number span { font-size: 24px; font-weight: bold; color: #1a3a5c; }
    .items { border-top: 1px solid #eee; padding-top: 20px; }
    .item { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
    .totals { margin-top: 20px; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .total-row.final { font-weight: bold; font-size: 18px; color: #1a3a5c; border-top: 2px solid #1a3a5c; padding-top: 10px; margin-top: 10px; }
    .footer { background: #1a3a5c; color: white; padding: 20px; text-align: center; font-size: 14px; }
    .btn { display: inline-block; background: #c5a572; color: #1a3a5c; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LT's Business</h1>
      <p>Order Confirmation</p>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thank you for your order! We're excited to get started on your custom items.</p>

      <div class="order-number">
        <p style="margin: 0; color: #666;">Order Number</p>
        <span>${data.orderId}</span>
      </div>

      <div class="items">
        <h3>Order Details</h3>
        ${data.items.map((item) => `
          <div class="item">
            <span>${item.name} × ${item.quantity}</span>
            <span style="margin-left: auto;">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join("")}
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>$${data.totals.subtotal.toFixed(2)}</span>
        </div>
        ${data.totals.discount > 0 ? `
          <div class="total-row" style="color: green;">
            <span>Volume Discount</span>
            <span>-$${data.totals.discount.toFixed(2)}</span>
          </div>
        ` : ""}
        ${data.totals.embroidery > 0 ? `
          <div class="total-row">
            <span>Embroidery</span>
            <span>$${data.totals.embroidery.toFixed(2)}</span>
          </div>
        ` : ""}
        <div class="total-row">
          <span>Shipping</span>
          <span>${data.totals.shipping === 0 ? "FREE" : `$${data.totals.shipping.toFixed(2)}`}</span>
        </div>
        <div class="total-row final">
          <span>Total</span>
          <span>$${data.totals.total.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 20px; background: #f5f2ed; border-radius: 8px;">
        <h4 style="margin-top: 0;">Shipping To:</h4>
        <p style="margin: 0;">
          ${data.shippingAddress.name}<br>
          ${data.shippingAddress.address}<br>
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zip}
        </p>
        <p style="margin-top: 15px; margin-bottom: 0;">
          <strong>Estimated Delivery:</strong> ${data.estimatedDelivery}
        </p>
      </div>

      <div style="text-align: center;">
        <a href="https://ltsbusiness.com/order-tracking?id=${data.orderId}" class="btn">Track Your Order</a>
      </div>
    </div>
    <div class="footer">
      <p>LT's Business | Portland, Maine</p>
      <p>207-774-1104 | business@ltsportland.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
