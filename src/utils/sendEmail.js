const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendResetEmail = async (email, name, resetUrl) => {
  // Fix double slash
  const cleanUrl = resetUrl.replace(/([^:]\/)\/+/g, "$1");

  const mailOptions = {
    from: `"CareerCoach" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password — CareerCoach",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="padding:32px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;">
                    <div style="width:44px;height:44px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:12px;">🎯</div>
                    <h1 style="margin:0;font-size:20px;font-weight:500;color:#fff;letter-spacing:-0.5px;">CareerCoach</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 8px;font-size:18px;font-weight:500;color:#fff;letter-spacing:-0.3px;">Reset Your Password</h2>
                    <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.4);line-height:1.6;">
                      Hi ${name}, we received a request to reset your password. Click the button below to create a new password.
                    </p>

                    <!-- Button -->
                    <a href="${cleanUrl}" style="display:inline-block;padding:12px 28px;background:#fff;color:#000;font-size:14px;font-weight:500;border-radius:10px;text-decoration:none;margin-bottom:24px;">
                      Reset Password →
                    </a>

                    <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.6;">
                      This link will expire in <strong style="color:rgba(255,255,255,0.4);">1 hour</strong>. If you didn't request a password reset, you can ignore this email.
                    </p>

                    <!-- URL fallback -->
                    <div style="margin-top:20px;padding:12px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;">
                      <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.2);">Or copy this link:</p>
                      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);word-break:break-all;">${cleanUrl}</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">
                      © 2026 CareerCoach · Dhaka, Bangladesh
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};


module.exports = { sendResetEmail };