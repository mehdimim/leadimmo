declare module 'nodemailer' {
  type MailOptions = Record<string, unknown>;

  type Transporter = {
    sendMail: (mailOptions: MailOptions) => Promise<unknown>;
  };

  const nodemailer: {
    createTransport: (options: Record<string, unknown>) => Transporter;
  };

  export default nodemailer;
}
