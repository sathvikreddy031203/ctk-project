import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  secure: true,
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: 'ctk07668@gmail.com',
    pass: 'jwwe tyqe erln qvdy' // App Password
  }
});

// OTP Mail
export const sendMailForOtp = async (to, sub, otp) => {
  transporter.sendMail(
    {
      to: to,
      subject: sub,
      html:
        "<h1>OTP for password change in CTKEvents</h1><p>Your OTP is <strong>" +
        otp +
        "</strong></p>",
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending OTP mail: ", err);
      } else {
        console.log("OTP Mail sent successfully: ", info.response);
      }
    }
  );
};

// 🎟️ Booking Confirmation Mail
export const sendBookingConfirmationMail = async (
  to,
  { userName, userPhone, eventName, eventDate, tickets, totalAmount }
) => {
  try {
    const info = await transporter.sendMail({
      from: "mvpsmvp313@gmail.com",  // ✅ required
      to,
      subject: `🎟️ Ticket Confirmation - ${eventName}`,
      html: `
        <h2>Hi ${userName},</h2>
        <p>Your ticket is <strong>confirmed</strong> for the event <b>${eventName}</b>.</p>
        <p><b>Date:</b> ${new Date(eventDate).toLocaleDateString()}</p>
        <p><b>Tickets:</b> ${tickets}</p>
        <p><b>Total Paid:</b> ₹${totalAmount}</p>
        <p><b>Phone:</b> ${userPhone}</p>
        <br/>
        <p>✅ Please show this email at the event entry.</p>
        <p>Thank you for booking with <b>CTKEvents</b>!</p>
      `,
    });

    console.log("✅ Booking confirmation mail sent:", info.response);
    console.log("Mail info object:", info);
    return info;
  } catch (err) {
    console.error("❌ Error sending booking confirmation mail:", err);
    throw err; // so your controller's catch block works
  }
};

export default transporter;