import nodemailer from 'nodemailer';
import createError from 'http-errors';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendResetEmail = async (email, token) => {
  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📨 Email Sent Successfully:', info);
  } catch (error) {
    console.error('🚨 SMTP Error:', error);
    throw createError(500, `Failed to send email: ${error.message}`);
  }
};
