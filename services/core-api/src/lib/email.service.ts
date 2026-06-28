import { transporter } from "./mailer.js";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailParams) => {
  try {
    const info = await transporter.sendMail({
      from: `"Votosi App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error: any) {
    throw new Error("Email could not be sent");
  }
};