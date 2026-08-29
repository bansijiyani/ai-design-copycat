"use server";

import { getMailer, getMailFrom, describeMailError } from "./mailer";

export async function sendOrderStatusEmail(order: any, profile: any, newStatus: string) {
  // Order status mail is best-effort: never fail the status update because the
  // notification could not go out.
  let transporter;
  try {
    transporter = getMailer();
  } catch (error) {
    console.error("Failed to send order status email:", error);
    return;
  }

  const statusText = newStatus.replace(/_/g, " ").toUpperCase();
  const subject = `Update on your FizTopz Order #${order.id.slice(0, 8)}`;
  
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FBF9F6; padding: 40px 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #722F37; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">FizTopz Order Update</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px; color: #555;">Hello ${profile?.full_name || 'Customer'},</p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px; color: #555;">The status of your order <strong>#${order.id.slice(0, 8)}</strong> has been updated to:</p>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="display: inline-block; background-color: #D4AF37; color: #ffffff; font-size: 18px; font-weight: bold; letter-spacing: 2px; padding: 10px 20px; border-radius: 4px;">
              ${statusText}
            </span>
          </div>

          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px; color: #555;">Order Details:</p>
          <ul style="list-style-type: none; padding: 0; margin-bottom: 25px;">
            ${order.order_items.map((item: any) => `
              <li style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                <span>${item.product_name} x ${item.quantity}</span>
                <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
              </li>
            `).join('')}
          </ul>
          
          <div style="text-align: right; font-size: 18px; font-weight: bold; margin-bottom: 25px;">
            Total: ₹${Number(order.total).toFixed(2)}
          </div>
          
          <p style="font-size: 14px; line-height: 1.5; color: #777;">If you have any questions, feel free to reply to this email.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} FizTopz. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to: profile.email,
      subject,
      html,
    });
    console.log(`Order status email sent to ${profile.email}`);
  } catch (error) {
    describeMailError(error);
  }
}
