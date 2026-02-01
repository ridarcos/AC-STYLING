export const getMagicLinkHtml = (url: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to AC Styling</title>
    <style>
        body { font-family: 'Times New Roman', serif; background-color: #E6DED6; margin: 0; padding: 0; color: #3D3630; }
        .container { max-width: 600px; margin: 0 auto; background-color: #E6DED6; padding: 40px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 30px; letter-spacing: 1px; color: #3D3630; }
        .content { background-color: #ffffff; padding: 40px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        h1 { font-size: 20px; font-weight: normal; margin-bottom: 20px; color: #3D3630; text-transform: uppercase; letter-spacing: 2px; }
        p { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #5A4F44; margin-bottom: 30px; }
        .button { display: inline-block; background-color: #3D3630; color: #E6DED6; padding: 15px 30px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; }
        .footer { margin-top: 30px; font-size: 10px; color: #8C847B; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">AC STYLING</div>
        <div class="content">
            <h1>Your Access Link</h1>
            <p>Welcome back to the Vault. Use the link below to securely sign in to your styling dashboard.</p>
            <a href="${url}" class="button">Enter The Vault</a>
            <p style="margin-top: 30px; font-size: 12px; color: #8C847B;">This link expires in 24 hours.</p>
        </div>
        <div class="footer">
            &copy; 2026 AC Styling. All Rights Reserved.
        </div>
    </div>
</body>
</html>
`;

export const getPasswordResetHtml = (url: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: 'Times New Roman', serif; background-color: #E6DED6; margin: 0; padding: 0; color: #3D3630; }
        .container { max-width: 600px; margin: 0 auto; background-color: #E6DED6; padding: 40px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 30px; letter-spacing: 1px; color: #3D3630; }
        .content { background-color: #ffffff; padding: 40px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        h1 { font-size: 20px; font-weight: normal; margin-bottom: 20px; color: #3D3630; text-transform: uppercase; letter-spacing: 2px; }
        p { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #5A4F44; margin-bottom: 30px; }
        .button { display: inline-block; background-color: #3D3630; color: #E6DED6; padding: 15px 30px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; }
        .footer { margin-top: 30px; font-size: 10px; color: #8C847B; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">AC STYLING</div>
        <div class="content">
            <h1>Reset Password</h1>
            <p>We received a request to reset your password. Click the button below to choose a new one.</p>
            <a href="${url}" class="button">Reset Password</a>
            <p style="margin-top: 30px; font-size: 12px; color: #8C847B;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            &copy; 2026 AC Styling. All Rights Reserved.
        </div>
    </div>
</body>
</html>
`;
