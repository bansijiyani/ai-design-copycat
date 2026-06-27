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
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>FizTopz ${type === "signup" ? "Registration" : "Admin Login"}</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 4px; color: #722F37;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
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
