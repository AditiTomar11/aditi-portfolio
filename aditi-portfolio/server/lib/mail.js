import nodemailer from 'nodemailer';
export async function notifyContact(data) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_EMAIL, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_EMAIL) return false;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  await transport.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: CONTACT_EMAIL,
    replyTo: data.email,
    subject: `Portfolio inquiry: ${data.interest}`,
    text: `Name: ${data.name}\nEmail: ${data.email}\nInterest: ${data.interest}\n\n${data.message}`,
  });
  return true;
}
