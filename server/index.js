const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Send verification emails via SMTP
// Only sends real email to test accounts, others are marked as sent
app.post('/api/send-verification-emails', async (req, res) => {
  const { smtpEmail, smtpPassword, recipients } = req.body;

  // Validate input
  if (!smtpEmail || !smtpPassword) {
    return res.status(400).json({
      success: false,
      error: 'SMTP email and password are required'
    });
  }

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Recipients list is required'
    });
  }

  try {
    // Create SMTP transporter (configured for Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword
      }
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    const results = {
      sent: [],
      failed: []
    };

    // Process all recipients
    for (const recipient of recipients) {
      const verificationToken = generateToken();
      const verificationLink = `https://verify.proofpanel.com/verify/${recipient.hashId}?token=${verificationToken}`;

      // Check if this is a test account (hashId starts with "TEST-")
      const isTestAccount = recipient.hashId.startsWith('TEST-');

      if (isTestAccount) {
        // Send real email only to test account
        const mailOptions = {
          from: `"ProofPanel Verification" <${smtpEmail}>`,
          to: recipient.email,
          subject: 'Verify Your Profile - ProofPanel',
          html: generateEmailTemplate(recipient, verificationLink)
        };

        try {
          const info = await transporter.sendMail(mailOptions);
          console.log(`Real email sent to test account ${recipient.email}: ${info.messageId}`);
          results.sent.push({
            hashId: recipient.hashId,
            email: recipient.email,
            verificationLink,
            messageId: info.messageId,
            isTestAccount: true
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${recipient.email}:`, emailError.message);
          results.failed.push({
            hashId: recipient.hashId,
            email: recipient.email,
            error: emailError.message
          });
        }
      } else {
        // For non-test accounts, just mark as sent without actually sending
        console.log(`Simulated email for ${recipient.email} (not a test account)`);
        results.sent.push({
          hashId: recipient.hashId,
          email: recipient.email,
          verificationLink,
          messageId: `simulated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isTestAccount: false
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.sent.length} emails (${results.sent.filter(s => s.isTestAccount).length} real, ${results.sent.filter(s => !s.isTestAccount).length} simulated), ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    console.error('SMTP Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send verification emails'
    });
  }
});

// Generate a random verification token
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// Generate email HTML template
function generateEmailTemplate(recipient, verificationLink) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Profile</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">ProofPanel</h1>
              <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 14px;">Zero-Knowledge Proof Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Verify Your Profile</h2>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You've been invited to verify your professional profile using our secure Zero-Knowledge Proof system. This verification helps ensure data quality while protecting your privacy.
              </p>

              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Verification ID:</p>
                <p style="color: #1f2937; font-size: 16px; font-family: monospace; margin: 0; word-break: break-all;">${recipient.hashId}</p>
              </div>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Click the button below to complete your profile verification. This link will expire in 7 days.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      Verify My Profile
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                If you didn't request this verification, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                This email was sent by ProofPanel. Your privacy is protected using Zero-Knowledge Proofs.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0; text-align: center;">
                &copy; ${new Date().getFullYear()} ProofPanel. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 ProofPanel Backend Server running at http://localhost:${PORT}`);
  console.log(`\n📚 Available Endpoints:`);
  console.log(`   GET  /api/health                      - Health check`);
  console.log(`   POST /api/send-verification-emails    - Send verification emails via SMTP`);
  console.log(`\n📧 Email Behavior:`);
  console.log(`   - Real emails are ONLY sent to test accounts (hashId starts with "TEST-")`);
  console.log(`   - Other panelists are marked as "Sent" without actual email delivery`);
  console.log(`\n📧 Email API Request Body:`);
  console.log(`   {`);
  console.log(`     "smtpEmail": "your-email@gmail.com",`);
  console.log(`     "smtpPassword": "your-app-password",`);
  console.log(`     "recipients": [`);
  console.log(`       { "hashId": "TEST-abc123", "email": "test@example.com" }`);
  console.log(`     ]`);
  console.log(`   }`);
});
