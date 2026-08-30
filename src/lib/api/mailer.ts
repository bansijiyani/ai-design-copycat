import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * Shared Gmail transporter.
 *
 * Server-only: this module reads SMTP_* and must never be imported from a
 * client component.
 */

let cached: Transporter | null = null;

/**
 * Google displays app passwords as four space-separated groups
 * ("abcd efgh ijkl mnop"). People paste them verbatim into .env, and the
 * literal spaces are sent as part of the AUTH PLAIN payload, which Gmail
 * rejects with 535. Strip all whitespace so either form works.
 */
function normalizePassword(pass: string) {
  return pass.replace(/\s+/g, "");
}

export function getMailer(): Transporter {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(
      "Email is not configured on the server (SMTP_USER / SMTP_PASS are missing)."
    );
  }

  if (!cached) {
    cached = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: normalizePassword(pass) },
    });
  }

  return cached;
}

export function getMailFrom(label = "FizTopz") {
  return `"${label}" <${process.env.SMTP_USER}>`;
}

/**
 * Turn a nodemailer failure into something the caller can act on.
 *
 * Server Actions strip error messages in production builds unless the error is
 * thrown deliberately, so the message here is written to be safe to show a
 * user: it explains the category of failure without leaking credentials.
 */
export function describeMailError(err: any): string {
  if (err?.code === "EAUTH" || err?.responseCode === 535) {
    // The app password was revoked, regenerated, or 2-Step Verification was
    // turned off on the sending account (which invalidates all app passwords).
    console.error(
      "[mailer] Gmail rejected SMTP_USER/SMTP_PASS (535). Generate a new " +
        "App Password at https://myaccount.google.com/apppasswords and update " +
        "SMTP_PASS in the environment.",
      { user: process.env.SMTP_USER, response: err?.response }
    );
    return "Email service is temporarily unavailable. Please contact support.";
  }

  if (err?.code === "ECONNECTION" || err?.code === "ETIMEDOUT" || err?.code === "ESOCKET") {
    console.error("[mailer] Could not reach the SMTP server.", err);
    return "Could not reach the email server. Please try again in a moment.";
  }

  console.error("[mailer] Unexpected send failure.", err);
  return "Failed to send email. Please try again.";
}
