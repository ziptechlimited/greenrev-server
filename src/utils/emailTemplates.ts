export const getBaseEmailTemplate = (content: string) => {
  const logoUrl = `${process.env.FRONTEND_URL?.replace(/\/$/, "") || "https://www.greenrevs.com"}/logo.png`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GreenRev Motors</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@600;700;800&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #050505;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #050505;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo-image {
      height: 70px;
      max-height: 70px;
      object-fit: contain;
    }
    .card {
      background-color: #0d0d0d;
      border: 1px solid #1c1c1c;
      border-radius: 20px;
      padding: 48px 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .content {
      font-size: 16px;
      line-height: 1.7;
      color: #b3b3b3;
    }
    .content h1 {
      color: #ffffff;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 28px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }
    .content p {
      margin-top: 0;
      margin-bottom: 24px;
    }
    .content strong {
      color: #ffffff;
    }
    .button-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .button {
      display: inline-block;
      background-color: #A3E635;
      color: #000000 !important;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 16px 36px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 8px 24px rgba(163, 230, 53, 0.25);
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #52525b;
      line-height: 1.6;
      font-family: 'Inter', sans-serif;
    }
    .footer a {
      color: #A3E635;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-container">
        <a href="https://www.greenrevs.com" target="_blank">
          <img src="${logoUrl}" alt="GreenRev Motors" class="logo-image" />
        </a>
      </div>
      <div class="card">
        <div class="content">
          ${content}
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} <a href="https://www.greenrevs.com" target="_blank">GreenRev Motors</a>. All rights reserved.<br>
        This is an automated message from our global concierge, please do not reply.
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const getVerificationEmailTemplate = (verifyPin: string) => {
  const content = `
    <h1>Verify Your Email</h1>
    <p>Welcome to GreenRev Motors! Please use the 6-digit PIN code below to complete your registration and verify your email address.</p>
    <div style="background: #050505; border: 1px solid rgba(163,230,53,0.25); border-radius: 16px; padding: 24px 32px; text-align: center; margin: 36px 0;">
      <span style="font-family: monospace; font-size: 38px; font-weight: 700; color: #A3E635; letter-spacing: 10px; margin-left: 10px;">${verifyPin}</span>
    </div>
    <p style="margin-top: 32px; font-size: 14px; color: #52525b;">If you did not request this verification code, you can safely ignore this email.</p>
  `;
  return getBaseEmailTemplate(content);
};

export const getNewAcquisitionRequestTemplate = (customerName: string, productName: string) => {
  const content = `
    <h1>New Acquisition Request</h1>
    <p>Hello,</p>
    <p>Great news! You have received a new acquisition request from <strong>${customerName}</strong> for your vehicle <strong>${productName}</strong>.</p>
    <p>Please log in to your vendor dashboard to review and accept this request to proceed with the transaction.</p>
    <div class="button-container">
      <a href="${process.env.FRONTEND_URL || 'https://www.greenrevs.com'}/vendor/requests" class="button" target="_blank">View Request</a>
    </div>
  `;
  return getBaseEmailTemplate(content);
};

export const getPasswordResetTemplate = (resetUrl: string) => {
  const content = `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password. Click the button below to choose a new password.</p>
    <div class="button-container">
      <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
    </div>
    <p style="margin-top: 32px; font-size: 14px; color: #52525b;">If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.</p>
  `;
  return getBaseEmailTemplate(content);
};
