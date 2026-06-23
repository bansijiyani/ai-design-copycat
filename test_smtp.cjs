const nodemailer = require("nodemailer");

async function test() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.error("Missing SMTP_USER or SMTP_PASS in .env");
    process.exit(1);
  }

  console.log("Testing SMTP connection for:", user);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Test" <${user}>`,
      to: user, // send to self
      subject: "Test SMTP Email",
      text: "If you are reading this, the SMTP configuration works!",
    });
    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
test();
