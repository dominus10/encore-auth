import nodemailer from "nodemailer";
import "dotenv/config";

export async function sendMail(
  email: string,
  token: string,
  from: string = "Encore Auth"
) {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAILERADDR,
      pass: process.env.MAILERPASS,
    },
  });

  const mailOption = {
    from: `${from} <${process.env.MAILERADDR?.split("@")[0]}@${
      process.env.MAILERADDR?.split("@")[1]
    }>`,
    to: email,
    subject: "Confirm Your Registration",
    text: `Thank you for registering! Please click the link below to confirm your email:\n\n ${process.env.FRONTEND_BASEURL}/confirm?token=${token}`,
  };

  await transport.sendMail(mailOption);
}
