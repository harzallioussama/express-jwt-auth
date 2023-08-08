const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    prot: 25,
    auth: {
      user: "mailTrapCredential",
      pass: "mailTrapCredential",
    },
  });
  const mailOption = {
    from: "harous",
    to: option.email,
    subject: option.subject,
    text: option.text,
  };

  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;
