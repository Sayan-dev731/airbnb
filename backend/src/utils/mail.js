import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: process.env.NODEMAILER_SMTP || "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_MAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });
};

/**
 * Base template generator for Airbnb branded emails
 */
const getEmailTemplate = ({ title, preheader, content, actionBtn }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; color: #222222; }
      .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #ebebeb; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
      .header { padding: 28px 36px; border-bottom: 1px solid #ebebeb; display: flex; align-items: center; }
      .logo { font-size: 26px; font-weight: 800; color: #FF385C; text-decoration: none; display: inline-flex; align-items: center; }
      .body { padding: 36px; }
      h1 { font-size: 24px; font-weight: 700; margin: 0 0 16px; color: #222222; }
      p { font-size: 16px; line-height: 1.6; color: #555555; margin: 0 0 20px; }
      .btn { display: inline-block; background: linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 28px; border-radius: 8px; margin: 12px 0 24px; text-align: center; }
      .otp-box { background: #f7f7f7; border: 1px dashed #dddddd; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 6px; text-align: center; padding: 16px; color: #222222; margin: 20px 0; }
      .footer { background: #f7f7f7; padding: 24px 36px; font-size: 12px; color: #888888; text-align: center; border-top: 1px solid #ebebeb; }
      .footer a { color: #222222; text-decoration: underline; }
    </style>
  </head>
  <body>
    <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      ${preheader || title}
    </div>
    <div class="container">
      <div class="header">
        <span class="logo">airbnb</span>
      </div>
      <div class="body">
        <h1>${title}</h1>
        ${content}
        ${actionBtn ? `<div style="text-align: center;"><a href="${actionBtn.url}" class="btn" target="_blank">${actionBtn.text}</a></div>` : ""}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px;">Airbnb Clone Inc. Built for high performance and reliability.</p>
        <p style="margin: 0;">This email was sent to you because you created an account on Airbnb.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Send email verification link & code
 */
export const sendVerificationEmail = async (email, username, token, otp) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${token}`;

    const htmlContent = getEmailTemplate({
      title: "Verify your email address",
      preheader: "Complete your Airbnb registration",
      content: `
        <p>Hi <strong>${username}</strong>,</p>
        <p>Welcome to Airbnb! Please verify your email address to confirm your account and start discovering unique places to stay around the world.</p>
        <p>You can verify your email using the button below or enter this 6-digit verification code:</p>
        <div class="otp-box">${otp}</div>
        <p>This code will expire in <strong>24 hours</strong>. If you did not create an account, you can safely ignore this email.</p>
      `,
      actionBtn: {
        text: "Confirm Email Address",
        url: verificationUrl,
      },
    });

    const mailOptions = {
      from: `"Airbnb" <${process.env.NODEMAILER_MAIL}>`,
      to: email,
      subject: "Confirm your Airbnb account",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    // Don't crash request if mail fails in local test, return null
    return null;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, username, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    const htmlContent = getEmailTemplate({
      title: "Reset your Airbnb password",
      preheader: "Password reset request",
      content: `
        <p>Hi <strong>${username}</strong>,</p>
        <p>We received a request to reset the password for your Airbnb account. Click the button below to choose a new password:</p>
      `,
      actionBtn: {
        text: "Reset Password",
        url: resetUrl,
      },
    });

    const mailOptions = {
      from: `"Airbnb Security" <${process.env.NODEMAILER_MAIL}>`,
      to: email,
      subject: "Reset your Airbnb password",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return null;
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (user, booking, listing) => {
  try {
    const transporter = createTransporter();

    const htmlContent = getEmailTemplate({
      title: "Your reservation is confirmed!",
      preheader: `Booking confirmation for ${listing.title}`,
      content: `
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You're all set for <strong>${listing.title}</strong> in <strong>${listing.location?.city || "your destination"}</strong>.</p>
        <div style="background: #f7f7f7; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Confirmation Code:</strong> <span style="font-family: monospace; font-weight: 700; color: #FF385C;">${booking._id}</span></p>
          <p style="margin: 0 0 8px;"><strong>Check-in:</strong> ${new Date(booking.checkInDate).toDateString()}</p>
          <p style="margin: 0 0 8px;"><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toDateString()}</p>
          <p style="margin: 0 0 8px;"><strong>Total Nights:</strong> ${booking.nightsCount}</p>
          <p style="margin: 0;"><strong>Total Paid:</strong> ₹${booking.pricingBreakdown?.grandTotal?.toLocaleString() || booking.pricingBreakdown?.grandTotal}</p>
        </div>
        <p>We hope you have an incredible trip!</p>
      `,
    });

    const mailOptions = {
      from: `"Airbnb Reservations" <${process.env.NODEMAILER_MAIL}>`,
      to: user.email,
      subject: `Reservation Confirmed - ${listing.title}`,
      html: htmlContent,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return null;
  }
};

/**
 * Send payment invoice & receipt email
 */
export const sendPaymentInvoiceEmail = async (user, payment, booking, listing) => {
  try {
    const transporter = createTransporter();
    const pb = payment.pricingBreakdown || booking.pricingBreakdown || {};

    const methodDesc =
      payment.paymentMethod?.type === "card"
        ? `Card ending in ${payment.paymentMethod.last4 || "••••"} (${(payment.paymentMethod.brand || "card").toUpperCase()})`
        : payment.paymentMethod?.type === "upi"
          ? `UPI (${payment.paymentMethod.maskedVpa || "Verified VPA"})`
          : payment.paymentMethod?.type === "netbanking"
            ? `Net Banking (${payment.paymentMethod.bankName || "Bank"})`
            : "Saved Payment Method";

    const content = `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for your payment. Your booking has been secured and your payment of <strong>₹${payment.amount?.toLocaleString()}</strong> has been successfully processed.</p>
      
      <div style="background: #F8F9FA; border: 1px solid #EAEAEA; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E0E0E0; padding-bottom: 12px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 12px; color: #717171; text-transform: uppercase;">RECEIPT NUMBER</div>
            <div style="font-size: 15px; font-weight: 700; font-family: monospace;">${payment.receiptNumber || "REC-" + payment._id}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #717171; text-transform: uppercase;">TRANSACTION ID</div>
            <div style="font-size: 14px; font-family: monospace; color: #222222;">${payment.transactionId}</div>
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <div style="font-size: 14px; font-weight: 600; color: #222222;">${listing.title}</div>
          <div style="font-size: 13px; color: #717171;">${listing.location?.city || "Destination"}, India · ${booking.nightsCount} nights (${new Date(booking.checkInDate).toLocaleDateString()} - ${new Date(booking.checkOutDate).toLocaleDateString()})</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 10px;">
          <tr style="border-bottom: 1px solid #EEEEEE;">
            <td style="padding: 6px 0; color: #555555;">₹${pb.basePricePerNight?.toLocaleString()} x ${booking.nightsCount} nights</td>
            <td style="padding: 6px 0; text-align: right; color: #222222;">₹${pb.baseTotal?.toLocaleString()}</td>
          </tr>
          ${pb.discountAmount > 0 ? `
          <tr style="border-bottom: 1px solid #EEEEEE; color: #137333;">
            <td style="padding: 6px 0;">Weekly stay discount (${pb.discountPercentage}%)</td>
            <td style="padding: 6px 0; text-align: right;">-₹${pb.discountAmount?.toLocaleString()}</td>
          </tr>` : ""}
          <tr style="border-bottom: 1px solid #EEEEEE;">
            <td style="padding: 6px 0; color: #555555;">Cleaning fee</td>
            <td style="padding: 6px 0; text-align: right; color: #222222;">₹${pb.cleaningFee?.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #EEEEEE;">
            <td style="padding: 6px 0; color: #555555;">Airbnb service fee</td>
            <td style="padding: 6px 0; text-align: right; color: #222222;">₹${pb.serviceFee?.toLocaleString()}</td>
          </tr>
          <tr style="border-bottom: 1px solid #EEEEEE;">
            <td style="padding: 6px 0; color: #555555;">Taxes & GST (18%)</td>
            <td style="padding: 6px 0; text-align: right; color: #222222;">₹${pb.taxes?.toLocaleString()}</td>
          </tr>
          <tr style="font-weight: 700; font-size: 16px; color: #222222;">
            <td style="padding: 12px 0 4px;">Total Paid (INR)</td>
            <td style="padding: 12px 0 4px; text-align: right; color: #FF385C;">₹${payment.amount?.toLocaleString()}</td>
          </tr>
        </table>

        <div style="border-top: 1px dashed #DDDDDD; margin-top: 14px; padding-top: 10px; font-size: 12px; color: #717171;">
          <strong>Payment Method:</strong> ${methodDesc} · <strong>Status:</strong> Paid & Verified
        </div>
      </div>

      <p style="font-size: 13px; color: #717171;">Need help with your reservation or invoice? Visit the Airbnb Help Centre or contact our 24/7 support.</p>
    `;

    const htmlContent = getEmailTemplate({
      title: "Payment Receipt from Airbnb",
      preheader: `Payment Receipt for ₹${payment.amount?.toLocaleString()} - ${listing.title}`,
      content,
    });

    const mailOptions = {
      from: `"Airbnb Billing" <${process.env.NODEMAILER_MAIL}>`,
      to: user.email,
      subject: `Payment Receipt: ₹${payment.amount?.toLocaleString()} for ${listing.title}`,
      html: htmlContent,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending payment invoice email:", error);
    return null;
  }
};

