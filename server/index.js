const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = 3002;

// LinkedIn OAuth Configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/verify/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors());
app.use(express.json());

// In-memory store for respondent attributes (keyed by hashId)
// In production, this should be a database
const respondentAttributesStore = new Map();

// In-memory store for verified panelists (keyed by hashId)
// Stores verification status and timestamp
const verifiedPanelistsStore = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get respondent attributes by hashId
app.get('/api/respondent/:hashId', (req, res) => {
  const { hashId } = req.params;
  const attributes = respondentAttributesStore.get(hashId);

  if (attributes) {
    res.json({ success: true, data: attributes });
  } else {
    res.json({ success: false, error: 'Respondent not found' });
  }
});

// Get verification status for a single panelist
app.get('/api/verification-status/:hashId', (req, res) => {
  const { hashId } = req.params;
  const status = verifiedPanelistsStore.get(hashId);

  if (status) {
    res.json({ success: true, data: status });
  } else {
    res.json({ success: true, data: { verified: false, proofStatus: 'Pending' } });
  }
});

// Get verification statuses for multiple panelists
app.post('/api/verification-statuses', (req, res) => {
  const { hashIds } = req.body;

  if (!hashIds || !Array.isArray(hashIds)) {
    return res.status(400).json({ success: false, error: 'hashIds array is required' });
  }

  const statuses = {};
  for (const hashId of hashIds) {
    const status = verifiedPanelistsStore.get(hashId);
    statuses[hashId] = status || { verified: false, proofStatus: 'Pending' };
  }

  res.json({ success: true, data: statuses });
});

// Clear verification statuses (used when config changes)
app.post('/api/clear-verification-statuses', (req, res) => {
  const { hashIds } = req.body;

  if (hashIds && Array.isArray(hashIds)) {
    // Clear specific hashIds
    for (const hashId of hashIds) {
      verifiedPanelistsStore.delete(hashId);
      respondentAttributesStore.delete(hashId);
    }
  } else {
    // Clear all
    verifiedPanelistsStore.clear();
    respondentAttributesStore.clear();
  }

  console.log('Verification statuses cleared');
  res.json({ success: true, message: 'Verification statuses cleared' });
});

// LinkedIn OAuth - Get Authorization URL
app.get('/api/linkedin/auth-url', (req, res) => {
  const { hashId } = req.query;

  if (!LINKEDIN_CLIENT_ID) {
    return res.status(500).json({
      success: false,
      error: 'LinkedIn Client ID not configured'
    });
  }

  // State parameter to prevent CSRF and pass hashId
  const state = Buffer.from(JSON.stringify({ hashId, nonce: crypto.randomBytes(16).toString('hex') })).toString('base64');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state: state,
    scope: 'openid profile email'
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  res.json({
    success: true,
    authUrl
  });
});

// LinkedIn OAuth - Exchange Code for Token
app.post('/api/linkedin/callback', async (req, res) => {
  const { code, state } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Authorization code is required'
    });
  }

  try {
    // Decode state to get hashId
    let hashId = null;
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
        hashId = decoded.hashId;
      } catch (e) {
        console.error('Failed to decode state:', e);
      }
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('LinkedIn token error:', tokenData);
      return res.status(400).json({
        success: false,
        error: tokenData.error_description || 'Failed to exchange code for token'
      });
    }

    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    let profileData = null;

    // Try to decode id_token first (contains user info for OpenID Connect)
    if (idToken) {
      try {
        // Decode JWT payload (id_token is a JWT)
        const payload = idToken.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        console.log('Decoded id_token:', decoded);
        profileData = {
          sub: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          email_verified: decoded.email_verified,
          given_name: decoded.given_name,
          family_name: decoded.family_name,
        };
      } catch (decodeError) {
        console.error('Failed to decode id_token:', decodeError);
      }
    }

    // Fallback to userinfo endpoint if id_token decode failed
    if (!profileData) {
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        console.error('LinkedIn profile error:', profileData);
        console.error('Profile response status:', profileResponse.status);
        return res.status(400).json({
          success: false,
          error: `Failed to fetch LinkedIn profile: ${profileData.message || profileData.error || JSON.stringify(profileData)}`
        });
      }
    }

    // Get stored respondent attributes
    const respondentAttributes = respondentAttributesStore.get(hashId) || {};

    // Mark panelist as verified
    if (hashId) {
      verifiedPanelistsStore.set(hashId, {
        verified: true,
        proofStatus: 'Verified',
        verifiedAt: new Date().toISOString(),
        linkedinName: profileData.name,
        linkedinEmail: profileData.email,
      });
      console.log(`Panelist ${hashId} marked as verified`);
    }

    // Return the profile data with respondent attributes
    res.json({
      success: true,
      data: {
        hashId,
        linkedin: {
          sub: profileData.sub,
          name: profileData.name,
          email: profileData.email,
          picture: profileData.picture,
          email_verified: profileData.email_verified
        },
        attributes: {
          jobTitle: respondentAttributes.jobTitle,
          industry: respondentAttributes.industry,
          companySize: respondentAttributes.companySize,
        },
        verified: true,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete LinkedIn authentication'
    });
  }
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
      // Use localhost for development, change to production URL in production
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${baseUrl}/verify/${recipient.hashId}?token=${verificationToken}`;

      // Store respondent attributes for later retrieval during verification
      respondentAttributesStore.set(recipient.hashId, {
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        email: recipient.email,
        company: recipient.company,
        location: recipient.location,
        employmentStatus: recipient.employmentStatus,
        jobTitle: recipient.jobTitle,
        jobFunction: recipient.jobFunction,
        companySize: recipient.companySize,
        industry: recipient.industry,
      });

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
  console.log(`   GET  /api/respondent/:hashId          - Get stored respondent attributes`);
  console.log(`   GET  /api/verification-status/:hashId - Get verification status for a panelist`);
  console.log(`   POST /api/verification-statuses       - Get verification statuses for multiple panelists`);
  console.log(`   GET  /api/linkedin/auth-url           - Get LinkedIn OAuth URL`);
  console.log(`   POST /api/linkedin/callback           - Exchange LinkedIn code for token`);
  console.log(`   POST /api/send-verification-emails    - Send verification emails via SMTP`);
  console.log(`\n🔗 LinkedIn OAuth Configuration:`);
  console.log(`   Client ID: ${LINKEDIN_CLIENT_ID ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`   Client Secret: ${LINKEDIN_CLIENT_SECRET ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`   Redirect URI: ${LINKEDIN_REDIRECT_URI}`);
  console.log(`\n📧 Email Behavior:`);
  console.log(`   - Real emails are ONLY sent to test accounts (hashId starts with "TEST-")`);
  console.log(`   - Other panelists are marked as "Sent" without actual email delivery`);
});
