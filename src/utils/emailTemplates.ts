export const getBaseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GreenRev</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #000000;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ffffff;
      text-decoration: none;
      text-transform: uppercase;
      margin-bottom: 40px;
      display: inline-block;
    }
    .logo span {
      color: #10B981;
    }
    .card {
      background-color: #111111;
      border: 1px solid #222222;
      border-radius: 12px;
      padding: 40px;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
      color: #a1a1aa;
    }
    .content h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .content h2 {
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      margin: 32px 0;
      text-align: center;
      letter-spacing: 4px;
    }
    .content p {
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      background-color: #10B981;
      color: #000000;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 16px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #52525b;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="#" class="logo">Green<span>Rev</span></a>
    <div class="card">
      <div class="content">
        ${content}
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} GreenRev. All rights reserved.<br>
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>
`;

export const getVerificationEmailTemplate = (verifyPin: string) => {
  const content = `
    <h1>Verify Your Email</h1>
    <p>Welcome to GreenRev! Please use the 6-digit PIN code below to complete your registration and verify your email address.</p>
    <div style="background: #000; border: 1px solid #333; border-radius: 8px; padding: 20px; text-align: center;">
      <h2 style="margin: 0; font-family: monospace;">${verifyPin}</h2>
    </div>
    <p style="margin-top: 32px; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
  `;
  return getBaseEmailTemplate(content);
};

export const getNewAcquisitionRequestTemplate = (customerName: string, productName: string) => {
  const content = `
    <h1>New Acquisition Request</h1>
    <p>Hello,</p>
    <p>Great news! You have received a new acquisition request from <strong>${customerName}</strong> for your product <strong>${productName}</strong>.</p>
    <p>Please log in to your vendor dashboard to review and accept this request to proceed with the transaction.</p>
    <center>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/vendor/requests" class="button">View Request</a>
    </center>
  `;
  return getBaseEmailTemplate(content);
};

export const getPasswordResetTemplate = (resetUrl: string) => {
  const content = `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password. Click the button below to choose a new password.</p>
    <center>
      <a href="${resetUrl}" class="button">Reset Password</a>
    </center>
    <p style="margin-top: 32px; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.</p>
  `;
  return getBaseEmailTemplate(content);
};
