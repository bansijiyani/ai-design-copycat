"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

export async function sendOtpEmail({ data: { email, type } }: { data: { email: string, type: "signup" | "admin_login" } }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials not configured.");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  // Delete any existing OTPs for this email/type to prevent verification conflicts
  await supabaseAdmin
    .from("otp_codes")
    .delete()
    .eq("email", email)
    .eq("type", type);

  const { error: dbError } = await supabaseAdmin
    .from("otp_codes")
    .insert({
      email,
      otp,
      type,
      expires_at: expiresAt.toISOString(),
    });

  if (dbError) throw new Error("Failed to generate OTP: " + dbError.message);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = type === "signup" ? "Verify your email address" : "Admin Dashboard 2FA Code";
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FBF9F6; padding: 40px 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #722F37; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">FizTopz ${type === "signup" ? "Registration" : "Admin Verification"}</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px; text-align: center;">
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px; color: #555;">Please use the following verification code to complete your ${type === "signup" ? "registration" : "login"} process.</p>
          
          <div style="background-color: #f9f9f9; border: 2px dashed #722F37; padding: 20px; margin: 30px auto; max-width: 300px; border-radius: 8px;">
            <h2 style="margin: 0; font-size: 36px; letter-spacing: 8px; color: #722F37; font-weight: bold;">${otp}</h2>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">This code will expire in exactly <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #aaa;">
          <p style="margin: 0;">© 2026 FizTopz. All rights reserved.</p>
        </div>
        
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FizTopz" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });
    return { success: true };
  } catch (err: any) {
    console.error("Nodemailer error:", err);
    throw new Error("Failed to send email");
  }
}

export async function verifyOtp({ data: { email, otp, type } }: { data: { email: string, otp: string, type: "signup" | "admin_login" } }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: codeData, error } = await supabaseAdmin
    .from("otp_codes")
    .select("*")
    .eq("email", email)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !codeData) throw new Error("Invalid or expired OTP");
  if (codeData.otp !== otp) throw new Error("Incorrect OTP");
  if (new Date() > new Date(codeData.expires_at)) {
    throw new Error("OTP has expired");
  }

  await supabaseAdmin.from("otp_codes").delete().eq("id", codeData.id);

  if (type === "signup") {
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (!userError && user.users) {
      const currentUser = user.users.find((u: any) => u.email === email);
      if (currentUser) {
        await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
          email_confirm: true,
          user_metadata: { ...currentUser.user_metadata, is_verified: true }
        });
      }
    }
    return { success: true, verified: true };
  }

  return { success: true, verified: true };
}
