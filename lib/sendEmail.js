import nodemailer from 'nodemailer';

export async function sendAccountDeletionEmail(to, username) {
  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  const info = await transporter.sendMail({
    from: `"Secure Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your account has been deleted",
    html: `
      <h3>Hello ${username},</h3>
      <p>Your account has been successfully deleted from our system.</p>
      <p>If this wasn't you, please contact us immediately.</p>
      <br/>
      <p>Regards,<br/>Secure Portal Team</p>
    `,
  });

  return info;
}
