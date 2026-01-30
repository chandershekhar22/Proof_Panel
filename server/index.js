const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3002;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url') {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized');
} else {
  console.log('Supabase not configured - using in-memory storage only');
}

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

// In-memory store for batch relationships (test account -> batch mates)
// When a test account verifies, we randomly verify 2 of its batch mates
const batchRelationshipsStore = new Map();

// Helper function to store verified panelist in Supabase
async function storeVerifiedPanelist(hashId, attributes, status = 'verified') {
  if (!supabase) {
    console.log('Supabase not configured, skipping database store');
    return;
  }

  try {
    const { error } = await supabase
      .from('verified_panelists')
      .upsert({
        hash_id: hashId,
        status: status, // 'verified' or 'failed'
        job_title: attributes.jobTitle || null,
        industry: attributes.industry || null,
        company_size: attributes.companySize || null,
        job_function: attributes.jobFunction || null,
        employment_status: attributes.employmentStatus || null,
        verified_at: new Date().toISOString(),
      }, { onConflict: 'hash_id' });

    if (error) {
      console.error('Error storing in Supabase:', error);
    } else {
      console.log(`Stored ${status} panelist ${hashId} in Supabase`);
    }
  } catch (err) {
    console.error('Supabase store error:', err);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== User Authentication Endpoints ====================

const SALT_ROUNDS = 10;
const VALID_ROLES = ['panel_company', 'insight_company', 'panelist'];

// Sign Up - Create new user
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required: email, password, firstName, lastName, role'
    });
  }

  // Validate role
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // Check if user already exists with this email and role
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email.toLowerCase())
      .eq('role', role)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected for new users
      console.error('Error checking existing user:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Failed to check existing user'
      });
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email and role already exists'
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: role
      })
      .select('id, email, first_name, last_name, role, created_at')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user account'
      });
    }

    console.log(`New user created: ${newUser.email} with role: ${newUser.role}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during signup'
    });
  }
});

// Sign In - Authenticate existing user
app.post('/api/auth/signin', async (req, res) => {
  const { email, password, role } = req.body;

  // Validate required fields
  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and role are required'
    });
  }

  // Validate role
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
    });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // Find user with matching email and role
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, role, created_at')
      .eq('email', email.toLowerCase())
      .eq('role', role)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No user found with this email and role
        return res.status(401).json({
          success: false,
          error: 'No account found with this email and role. Please sign up first.'
        });
      }
      console.error('Error fetching user:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate'
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    console.log(`User signed in: ${user.email} with role: ${user.role}`);

    res.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during signin'
    });
  }
});

// ==================== End User Authentication ====================

// ==================== Study/Survey Endpoints ====================

// Helper function to validate UUID format
function isValidUUID(str) {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Create and launch a new study
app.post('/api/studies', async (req, res) => {
  const {
    name,
    companyName,
    audience,
    targetingCriteria,
    targetCompletes,
    surveyLength,
    surveyMethod,
    externalUrl,
    cpi,
    payout,
    isUrgent,
    tags,
    createdBy,
    status // 'draft' or 'active' (launched)
  } = req.body;

  // Validate required fields
  if (!name || !audience || !targetCompletes || !surveyMethod) {
    return res.status(400).json({
      success: false,
      error: 'Required fields: name, audience, targetCompletes, surveyMethod'
    });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // Calculate total cost
    const effectiveCpi = cpi || 7.50;
    const totalCost = effectiveCpi * targetCompletes;
    const effectivePayout = payout || Math.round(effectiveCpi * 0.6 * 100) / 100; // 60% goes to panelist

    // Only include created_by if it's a valid UUID
    const validCreatedBy = isValidUUID(createdBy) ? createdBy : null;

    // Insert the study
    const { data: study, error: insertError } = await supabase
      .from('studies')
      .insert({
        name,
        company_name: companyName,
        audience,
        targeting_criteria: targetingCriteria || {},
        target_completes: targetCompletes,
        survey_length: surveyLength || 15,
        survey_method: surveyMethod,
        external_url: externalUrl,
        cpi: effectiveCpi,
        total_cost: totalCost,
        payout: effectivePayout,
        status: status || 'active', // Default to active (launched)
        is_urgent: isUrgent || false,
        created_by: validCreatedBy,
        launched_at: status === 'active' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating study:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create study'
      });
    }

    // Insert tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map(tag => ({
        study_id: study.id,
        tag: tag
      }));

      const { error: tagError } = await supabase
        .from('study_tags')
        .insert(tagInserts);

      if (tagError) {
        console.error('Error inserting tags:', tagError);
        // Don't fail the whole request for tag errors
      }
    }

    console.log(`New study created: ${study.name} (${study.id})`);

    res.status(201).json({
      success: true,
      message: 'Study created successfully',
      data: study
    });

  } catch (error) {
    console.error('Create study error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

// Get all studies (for insight company dashboard)
app.get('/api/studies', async (req, res) => {
  const { createdBy, status } = req.query;

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured'
      });
    }

    let query = supabase
      .from('studies')
      .select(`
        *,
        study_tags (tag)
      `)
      .order('created_at', { ascending: false });

    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: studies, error } = await query;

    if (error) {
      console.error('Error fetching studies:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch studies'
      });
    }

    // Format the response to flatten tags
    const formattedStudies = studies.map(study => ({
      ...study,
      tags: study.study_tags ? study.study_tags.map(t => t.tag) : [],
      study_tags: undefined
    }));

    res.json({
      success: true,
      data: formattedStudies
    });

  } catch (error) {
    console.error('Fetch studies error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

// Get available surveys for panelists (member dashboard)
app.get('/api/surveys/available', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // Get all active studies that haven't reached their target
    const { data: studies, error } = await supabase
      .from('studies')
      .select(`
        *,
        study_tags (tag)
      `)
      .eq('status', 'active')
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching available surveys:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch available surveys'
      });
    }

    // Format surveys for the member dashboard
    const availableSurveys = studies.map(study => ({
      id: study.id,
      title: study.name,
      company: study.company_name || 'Research Company',
      tags: study.study_tags ? study.study_tags.map(t => t.tag) : [],
      match: Math.floor(Math.random() * 15) + 85, // Random match 85-100% (in production, calculate based on panelist profile)
      duration: `${study.survey_length} min`,
      payout: study.payout,
      urgent: study.is_urgent,
      audience: study.audience,
      surveyMethod: study.survey_method,
      externalUrl: study.external_url,
      targetCompletes: study.target_completes,
      currentCompletes: study.current_completes || 0
    }));

    res.json({
      success: true,
      data: availableSurveys
    });

  } catch (error) {
    console.error('Fetch available surveys error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

// Get a single study by ID
app.get('/api/studies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const { data: study, error } = await supabase
      .from('studies')
      .select(`
        *,
        study_tags (tag)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Study not found'
        });
      }
      console.error('Error fetching study:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch study'
      });
    }

    const formattedStudy = {
      ...study,
      tags: study.study_tags ? study.study_tags.map(t => t.tag) : [],
      study_tags: undefined
    };

    res.json({
      success: true,
      data: formattedStudy
    });

  } catch (error) {
    console.error('Fetch study error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

// Update study status (pause, complete, cancel)
app.patch('/api/studies/:id', async (req, res) => {
  const { id } = req.params;
  const { status, currentCompletes } = req.body;

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const updates = {};

    if (status) {
      updates.status = status;
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      if (status === 'active') {
        updates.launched_at = new Date().toISOString();
      }
    }

    if (currentCompletes !== undefined) {
      updates.current_completes = currentCompletes;
    }

    const { data: study, error } = await supabase
      .from('studies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating study:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update study'
      });
    }

    res.json({
      success: true,
      message: 'Study updated successfully',
      data: study
    });

  } catch (error) {
    console.error('Update study error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

// ==================== End Study/Survey Endpoints ====================

// ==================== LinkedIn OAuth Endpoints ====================

// Get LinkedIn OAuth URL
app.get('/api/auth/linkedin', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const scope = 'openid profile email';

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
    `state=${state}&` +
    `scope=${encodeURIComponent(scope)}`;

  res.json({ success: true, authUrl, state });
});

// Exchange LinkedIn auth code for tokens and get profile
app.post('/api/auth/linkedin/callback', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: 'Authorization code is required' });
  }

  try {
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

    if (tokenData.error) {
      console.error('LinkedIn token error:', tokenData);
      return res.status(400).json({ success: false, error: tokenData.error_description || 'Failed to get access token' });
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile using the access token
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();

    if (profileData.error) {
      console.error('LinkedIn profile error:', profileData);
      return res.status(400).json({ success: false, error: 'Failed to fetch profile' });
    }

    // Return the profile data
    res.json({
      success: true,
      profile: {
        id: profileData.sub,
        name: profileData.name,
        email: profileData.email,
        picture: profileData.picture,
        emailVerified: profileData.email_verified,
      },
    });

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    res.status(500).json({ success: false, error: 'OAuth process failed' });
  }
});

// ==================== End LinkedIn OAuth ====================

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

// Get aggregated verified panelists data
app.get('/api/verified-panelists/aggregated', async (req, res) => {
  try {
    let verifiedData = [];
    let failedCount = 0;

    if (supabase) {
      // Fetch from Supabase
      const { data: verified, error: verifiedError } = await supabase
        .from('verified_panelists')
        .select('*')
        .eq('status', 'verified');

      if (verifiedError) {
        console.error('Supabase fetch error:', verifiedError);
      } else {
        verifiedData = verified || [];
      }

      const { count, error: countError } = await supabase
        .from('verified_panelists')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      if (!countError) {
        failedCount = count || 0;
      }
    } else {
      // Fall back to in-memory store
      for (const [hashId, status] of verifiedPanelistsStore.entries()) {
        if (status.proofStatus === 'Verified') {
          const attributes = respondentAttributesStore.get(hashId) || {};
          verifiedData.push({
            hash_id: hashId,
            job_title: attributes.jobTitle,
            industry: attributes.industry,
            company_size: attributes.companySize,
            job_function: attributes.jobFunction,
            employment_status: attributes.employmentStatus,
          });
        } else if (status.proofStatus === 'Failed') {
          failedCount++;
        }
      }
    }

    // Aggregate the data
    const aggregated = {
      jobTitle: {},
      industry: {},
      companySize: {},
      jobFunction: {},
      employmentStatus: {},
      totalVerified: verifiedData.length,
      totalFailed: failedCount,
    };

    for (const panelist of verifiedData) {
      // Job Title
      if (panelist.job_title) {
        aggregated.jobTitle[panelist.job_title] = (aggregated.jobTitle[panelist.job_title] || 0) + 1;
      }
      // Industry
      if (panelist.industry) {
        aggregated.industry[panelist.industry] = (aggregated.industry[panelist.industry] || 0) + 1;
      }
      // Company Size
      if (panelist.company_size) {
        aggregated.companySize[panelist.company_size] = (aggregated.companySize[panelist.company_size] || 0) + 1;
      }
      // Job Function
      if (panelist.job_function) {
        aggregated.jobFunction[panelist.job_function] = (aggregated.jobFunction[panelist.job_function] || 0) + 1;
      }
      // Employment Status
      if (panelist.employment_status) {
        aggregated.employmentStatus[panelist.employment_status] = (aggregated.employmentStatus[panelist.employment_status] || 0) + 1;
      }
    }

    res.json({
      success: true,
      data: aggregated,
    });
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch aggregated data',
    });
  }
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

      // Store in Supabase
      await storeVerifiedPanelist(hashId, respondentAttributes, 'verified');

      // If this is a test account, randomly verify 2 of its 4 batch mates
      if (hashId.startsWith('TEST-')) {
        const batchMates = batchRelationshipsStore.get(hashId) || [];
        if (batchMates.length > 0) {
          // Shuffle and pick 2 to verify, 2 to leave unverified
          const shuffled = [...batchMates].sort(() => Math.random() - 0.5);
          const toVerify = shuffled.slice(0, 2);
          const toFail = shuffled.slice(2, 4);

          // Mark 2 as verified
          for (const mateHashId of toVerify) {
            verifiedPanelistsStore.set(mateHashId, {
              verified: true,
              proofStatus: 'Verified',
              verifiedAt: new Date().toISOString(),
              linkedinName: 'Auto Verified',
              linkedinEmail: 'auto@verified.com',
              autoVerified: true,
            });
            console.log(`Batch mate ${mateHashId} auto-verified (2 of 4)`);

            // Store batch mate in Supabase
            const mateAttributes = respondentAttributesStore.get(mateHashId) || {};
            await storeVerifiedPanelist(mateHashId, mateAttributes, 'verified');
          }

          // Mark 2 as failed
          for (const mateHashId of toFail) {
            verifiedPanelistsStore.set(mateHashId, {
              verified: false,
              proofStatus: 'Failed',
              verifiedAt: new Date().toISOString(),
              failReason: 'Verification failed - attributes mismatch',
              autoVerified: true,
            });
            console.log(`Batch mate ${mateHashId} auto-failed (2 of 4)`);

            // Store failed panelist in Supabase
            const mateAttributes = respondentAttributesStore.get(mateHashId) || {};
            await storeVerifiedPanelist(mateHashId, mateAttributes, 'failed');
          }
        }
      }
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

    // Group recipients into batches (1 test + 4 regular per batch)
    // and store batch relationships for later verification
    let currentTestAccount = null;
    let currentBatchMates = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      if (recipient.hashId.startsWith('TEST-')) {
        // Save previous batch relationship if exists
        if (currentTestAccount && currentBatchMates.length > 0) {
          batchRelationshipsStore.set(currentTestAccount, [...currentBatchMates]);
          console.log(`Stored batch for ${currentTestAccount}: ${currentBatchMates.length} batch mates`);
        }
        // Start new batch
        currentTestAccount = recipient.hashId;
        currentBatchMates = [];
      } else if (currentTestAccount) {
        // Add to current batch
        currentBatchMates.push(recipient.hashId);
      }
    }
    // Save last batch
    if (currentTestAccount && currentBatchMates.length > 0) {
      batchRelationshipsStore.set(currentTestAccount, [...currentBatchMates]);
      console.log(`Stored batch for ${currentTestAccount}: ${currentBatchMates.length} batch mates`);
    }

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
  console.log(`   GET  /api/health                         - Health check`);
  console.log(`   POST /api/auth/signup                    - Create new user account`);
  console.log(`   POST /api/auth/signin                    - Sign in existing user`);
  console.log(`   GET  /api/respondent/:hashId             - Get stored respondent attributes`);
  console.log(`   GET  /api/verification-status/:hashId    - Get verification status for a panelist`);
  console.log(`   POST /api/verification-statuses          - Get verification statuses for multiple panelists`);
  console.log(`   GET  /api/verified-panelists/aggregated  - Get aggregated verified panelists data`);
  console.log(`   GET  /api/linkedin/auth-url              - Get LinkedIn OAuth URL`);
  console.log(`   POST /api/linkedin/callback              - Exchange LinkedIn code for token`);
  console.log(`   POST /api/send-verification-emails       - Send verification emails via SMTP`);
  console.log(`   POST /api/studies                        - Create and launch a new study`);
  console.log(`   GET  /api/studies                        - Get all studies (insight company)`);
  console.log(`   GET  /api/studies/:id                    - Get a single study`);
  console.log(`   PATCH /api/studies/:id                   - Update study status`);
  console.log(`   GET  /api/surveys/available              - Get available surveys (panelists)`);
  console.log(`\n🔗 LinkedIn OAuth Configuration:`);
  console.log(`   Client ID: ${LINKEDIN_CLIENT_ID ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`   Client Secret: ${LINKEDIN_CLIENT_SECRET ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`   Redirect URI: ${LINKEDIN_REDIRECT_URI}`);
  console.log(`\n💾 Supabase Configuration:`);
  console.log(`   Status: ${supabase ? '✓ Connected' : '✗ Not configured (using in-memory storage)'}`);
  console.log(`\n📧 Email Behavior:`);
  console.log(`   - Real emails are ONLY sent to test accounts (hashId starts with "TEST-")`);
  console.log(`   - Other panelists are marked as "Sent" without actual email delivery`);
});
