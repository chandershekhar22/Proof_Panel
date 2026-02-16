import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { getSupabase } from '@/lib/supabase';
import { errorResponse } from '@/lib/response';
import { generateEmailTemplate } from '@/lib/email-template';
import { NextResponse } from 'next/server';

// Allow up to 60 seconds for email sending on Vercel
export const maxDuration = 60;

interface Recipient {
  hashId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  company?: string;
  location?: string;
  employmentStatus?: string;
  jobTitle?: string;
  jobFunction?: string;
  companySize?: string;
  industry?: string;
}

function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { recipients } = await request.json();

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      return errorResponse('SMTP credentials not configured on server', 500);
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return errorResponse('Recipients list is required', 400);
    }

    const supabase = getSupabase();

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    await transporter.verify();

    const results = {
      sent: [] as Array<{
        hashId: string;
        email: string;
        verificationLink: string;
        messageId: string;
        isTestAccount: boolean;
      }>,
      failed: [] as Array<{ hashId: string; email: string; error: string }>,
    };

    // Build batch relationships and store in Supabase
    let currentTestAccount: string | null = null;
    let currentBatchMates: string[] = [];

    for (const recipient of recipients as Recipient[]) {
      if (recipient.hashId.startsWith('TEST-')) {
        // Save previous batch
        if (currentTestAccount && currentBatchMates.length > 0) {
          const batchInserts = currentBatchMates.map((mateId) => ({
            test_hash_id: currentTestAccount!,
            mate_hash_id: mateId,
          }));
          await supabase.from('batch_relationships').upsert(batchInserts, {
            onConflict: 'test_hash_id,mate_hash_id',
          });
        }
        currentTestAccount = recipient.hashId;
        currentBatchMates = [];
      } else if (currentTestAccount) {
        currentBatchMates.push(recipient.hashId);
      }
    }

    // Save last batch
    if (currentTestAccount && currentBatchMates.length > 0) {
      const batchInserts = currentBatchMates.map((mateId) => ({
        test_hash_id: currentTestAccount!,
        mate_hash_id: mateId,
      }));
      await supabase.from('batch_relationships').upsert(batchInserts, {
        onConflict: 'test_hash_id,mate_hash_id',
      });
    }

    // Process all recipients
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    for (const recipient of recipients as Recipient[]) {
      const verificationToken = generateToken();
      const verificationLink = `${frontendUrl}/verify/${recipient.hashId}?token=${verificationToken}`;

      // Store respondent attributes in Supabase
      await supabase.from('respondent_attributes').upsert(
        {
          hash_id: recipient.hashId,
          first_name: recipient.firstName || null,
          last_name: recipient.lastName || null,
          email: recipient.email,
          company: recipient.company || null,
          location: recipient.location || null,
          employment_status: recipient.employmentStatus || null,
          job_title: recipient.jobTitle || null,
          job_function: recipient.jobFunction || null,
          company_size: recipient.companySize || null,
          industry: recipient.industry || null,
        },
        { onConflict: 'hash_id' }
      );

      const isTestAccount = recipient.hashId.startsWith('TEST-');

      if (isTestAccount) {
        // Send real email only to test accounts
        const mailOptions = {
          from: `"ProofPanel Verification" <${smtpEmail}>`,
          to: recipient.email,
          subject: 'Verify Your Profile - ProofPanel',
          html: generateEmailTemplate(recipient, verificationLink),
        };

        try {
          const info = await transporter.sendMail(mailOptions);
          results.sent.push({
            hashId: recipient.hashId,
            email: recipient.email,
            verificationLink,
            messageId: info.messageId,
            isTestAccount: true,
          });
        } catch (emailError) {
          const errMsg = emailError instanceof Error ? emailError.message : 'Unknown error';
          results.failed.push({
            hashId: recipient.hashId,
            email: recipient.email,
            error: errMsg,
          });
        }
      } else {
        // Simulate sending for non-test accounts
        results.sent.push({
          hashId: recipient.hashId,
          email: recipient.email,
          verificationLink,
          messageId: `simulated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isTestAccount: false,
        });
      }
    }

    const realCount = results.sent.filter((s) => s.isTestAccount).length;
    const simCount = results.sent.filter((s) => !s.isTestAccount).length;

    return NextResponse.json({
      success: true,
      message: `Processed ${results.sent.length} emails (${realCount} real, ${simCount} simulated), ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error('SMTP Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Failed to send verification emails';
    return errorResponse(errMsg);
  }
}
