const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    prot: 25,
    auth: {
      user: "cf94e2dfc93fcc",
      pass: "0cb6b71a74c69e",
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
