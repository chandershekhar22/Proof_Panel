const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Test email from environment variable
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

app.use(cors());
app.use(express.json());

// Filter options based on your app's data points
const FILTER_OPTIONS = {
  employmentStatus: ['Currently employed', 'Recently active'],
  jobTitle: ['C-Level', 'VP+', 'Director+', 'Manager+', 'Individual Contributor'],
  jobFunction: [
    'IT Decision Maker',
    'Marketing DM',
    'HR Decision Maker',
    'Finance DM',
    'Procurement',
    'Sales DM',
    'Operations',
    'Legal/Compliance',
    'Product Mgmt',
    'Data/Analytics'
  ],
  companySize: [
    'Enterprise (10K+)',
    'Large (1K-10K)',
    'Mid-Market (100-999)',
    'SMB (10-99)',
    'Small (<10)'
  ],
  industry: [
    'Technology',
    'Financial Services',
    'Healthcare',
    'Manufacturing',
    'Retail/CPG',
    'Prof Services',
    'Energy/Utilities'
  ]
};

// Helper to generate unique hash ID
function generateHashId() {
  return crypto.randomBytes(16).toString('hex');
}

// Helper to pick random item from array
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate random date within last 2 years
function randomDate() {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 2);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// First names and last names for generating fake data
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const companies = ['TechCorp', 'InnovateSoft', 'DataDynamics', 'CloudNine Inc', 'Nexus Systems', 'Quantum Labs', 'FutureScale', 'Apex Solutions', 'Prime Digital', 'Vertex Technologies', 'Synergy Corp', 'BlueWave Tech', 'CyberEdge', 'Pinnacle Group', 'Horizon Enterprises', 'Summit Solutions', 'Catalyst Systems', 'Elevate Inc', 'Frontier Digital', 'CoreLogic'];
const locations = ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Atlanta, GA', 'Los Angeles, CA', 'Miami, FL', 'Portland, OR', 'Phoenix, AZ', 'Dallas, TX', 'Minneapolis, MN', 'Detroit, MI'];

// Generate a single respondent
function generateRespondent() {
  const firstName = randomFrom(firstNames);
  const lastName = randomFrom(lastNames);
  const company = randomFrom(companies);

  return {
    hashId: generateHashId(),
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
    company,
    location: randomFrom(locations),
    employmentStatus: randomFrom(FILTER_OPTIONS.employmentStatus),
    jobTitle: randomFrom(FILTER_OPTIONS.jobTitle),
    jobFunction: randomFrom(FILTER_OPTIONS.jobFunction),
    companySize: randomFrom(FILTER_OPTIONS.companySize),
    industry: randomFrom(FILTER_OPTIONS.industry),
    createdAt: randomDate(),
    lastActiveAt: randomDate(),
    verified: Math.random() > 0.2
  };
}

// Generate test respondent with the configured test email
function generateTestRespondent() {
  return {
    hashId: 'TEST-' + crypto.randomBytes(8).toString('hex'),
    firstName: 'Test',
    lastName: 'User',
    email: TEST_EMAIL,
    company: 'ProofPanel Test',
    location: 'Test Location',
    employmentStatus: 'Currently employed',
    jobTitle: 'C-Level',
    jobFunction: 'IT Decision Maker',
    companySize: 'Enterprise (10K+)',
    industry: 'Technology',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    verified: false,
    isTestAccount: true
  };
}

// Generate dataset
let respondentsCache = null;
function getRespondents(count = 500) {
  if (!respondentsCache) {
    // Always include the test respondent as the first item
    const testRespondent = generateTestRespondent();
    const otherRespondents = Array.from({ length: count - 1 }, generateRespondent);
    respondentsCache = [testRespondent, ...otherRespondents];
  }
  return respondentsCache;
}

// Filter respondents based on query params
function filterRespondents(respondents, filters) {
  return respondents.filter(r => {
    if (filters.employmentStatus && filters.employmentStatus.length > 0) {
      if (!filters.employmentStatus.includes(r.employmentStatus)) return false;
    }
    if (filters.jobTitle && filters.jobTitle.length > 0) {
      if (!filters.jobTitle.includes(r.jobTitle)) return false;
    }
    if (filters.jobFunction && filters.jobFunction.length > 0) {
      if (!filters.jobFunction.includes(r.jobFunction)) return false;
    }
    if (filters.companySize && filters.companySize.length > 0) {
      if (!filters.companySize.includes(r.companySize)) return false;
    }
    if (filters.industry && filters.industry.length > 0) {
      if (!filters.industry.includes(r.industry)) return false;
    }
    return true;
  });
}

// Parse filter params from query string
function parseFilters(query) {
  const filters = {};

  if (query.employmentStatus) {
    filters.employmentStatus = Array.isArray(query.employmentStatus)
      ? query.employmentStatus
      : query.employmentStatus.split(',');
  }
  if (query.jobTitle) {
    filters.jobTitle = Array.isArray(query.jobTitle)
      ? query.jobTitle
      : query.jobTitle.split(',');
  }
  if (query.jobFunction) {
    filters.jobFunction = Array.isArray(query.jobFunction)
      ? query.jobFunction
      : query.jobFunction.split(',');
  }
  if (query.companySize) {
    filters.companySize = Array.isArray(query.companySize)
      ? query.companySize
      : query.companySize.split(',');
  }
  if (query.industry) {
    filters.industry = Array.isArray(query.industry)
      ? query.industry
      : query.industry.split(',');
  }

  return filters;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get filter options
app.get('/api/v1/panel/filters', (req, res) => {
  res.json({
    success: true,
    data: FILTER_OPTIONS
  });
});

// Get users/respondents
app.get('/api/v1/panel/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const filters = parseFilters(req.query);

  const allRespondents = getRespondents(500);
  const filtered = filterRespondents(allRespondents, filters);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filtered.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
      records: paginatedData
    },
    appliedFilters: filters
  });
});

// Get profiles (similar to users but different structure)
app.get('/api/v1/panel/profiles', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const filters = parseFilters(req.query);

  const allRespondents = getRespondents(500);
  const filtered = filterRespondents(allRespondents, filters);

  // Transform to profile format
  const profiles = filtered.map(r => ({
    hashId: r.hashId,
    fullName: `${r.firstName} ${r.lastName}`,
    email: r.email,
    company: r.company,
    location: r.location,
    role: r.jobTitle,
    department: r.jobFunction,
    companySize: r.companySize,
    industry: r.industry,
    employmentStatus: r.employmentStatus,
    profileCompleteness: Math.floor(Math.random() * 40) + 60,
    lastUpdated: r.lastActiveAt
  }));

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = profiles.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      total: profiles.length,
      page,
      pageSize,
      totalPages: Math.ceil(profiles.length / pageSize),
      records: paginatedData
    },
    appliedFilters: filters
  });
});

// Get transactions
app.get('/api/v1/panel/transactions', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const filters = parseFilters(req.query);

  const allRespondents = getRespondents(500);
  const filtered = filterRespondents(allRespondents, filters);

  // Generate transactions for each respondent
  const transactions = [];
  const transactionTypes = ['Survey Completed', 'Profile Updated', 'Verification', 'Data Export', 'Login'];

  filtered.forEach(r => {
    const txCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < txCount; i++) {
      transactions.push({
        transactionId: generateHashId(),
        respondentHashId: r.hashId,
        respondentName: `${r.firstName} ${r.lastName}`,
        type: randomFrom(transactionTypes),
        amount: Math.floor(Math.random() * 100) + 10,
        status: randomFrom(['completed', 'pending', 'processing']),
        timestamp: randomDate(),
        metadata: {
          industry: r.industry,
          companySize: r.companySize,
          jobFunction: r.jobFunction
        }
      });
    }
  });

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = transactions.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      total: transactions.length,
      page,
      pageSize,
      totalPages: Math.ceil(transactions.length / pageSize),
      records: paginatedData
    },
    appliedFilters: filters
  });
});

// Get activities
app.get('/api/v1/panel/activities', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const filters = parseFilters(req.query);

  const allRespondents = getRespondents(500);
  const filtered = filterRespondents(allRespondents, filters);

  // Generate activities
  const activities = [];
  const activityTypes = ['page_view', 'click', 'form_submit', 'download', 'search', 'filter_apply'];

  filtered.forEach(r => {
    const actCount = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < actCount; i++) {
      activities.push({
        activityId: generateHashId(),
        respondentHashId: r.hashId,
        type: randomFrom(activityTypes),
        page: randomFrom(['/dashboard', '/profile', '/surveys', '/settings', '/reports']),
        duration: Math.floor(Math.random() * 300) + 10,
        timestamp: randomDate(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        metadata: {
          employmentStatus: r.employmentStatus,
          jobTitle: r.jobTitle,
          industry: r.industry
        }
      });
    }
  });

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = activities.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      total: activities.length,
      page,
      pageSize,
      totalPages: Math.ceil(activities.length / pageSize),
      records: paginatedData
    },
    appliedFilters: filters
  });
});

// Get single respondent by hashId
app.get('/api/v1/panel/users/:hashId', (req, res) => {
  const allRespondents = getRespondents(500);
  const respondent = allRespondents.find(r => r.hashId === req.params.hashId);

  if (!respondent) {
    return res.status(404).json({
      success: false,
      error: 'Respondent not found'
    });
  }

  res.json({
    success: true,
    data: respondent
  });
});

// Stats endpoint
app.get('/api/v1/panel/stats', (req, res) => {
  const allRespondents = getRespondents(500);

  const stats = {
    totalRespondents: allRespondents.length,
    byEmploymentStatus: {},
    byJobTitle: {},
    byJobFunction: {},
    byCompanySize: {},
    byIndustry: {},
    verifiedCount: allRespondents.filter(r => r.verified).length
  };

  allRespondents.forEach(r => {
    stats.byEmploymentStatus[r.employmentStatus] = (stats.byEmploymentStatus[r.employmentStatus] || 0) + 1;
    stats.byJobTitle[r.jobTitle] = (stats.byJobTitle[r.jobTitle] || 0) + 1;
    stats.byJobFunction[r.jobFunction] = (stats.byJobFunction[r.jobFunction] || 0) + 1;
    stats.byCompanySize[r.companySize] = (stats.byCompanySize[r.companySize] || 0) + 1;
    stats.byIndustry[r.industry] = (stats.byIndustry[r.industry] || 0) + 1;
  });

  res.json({
    success: true,
    data: stats
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Mock API Server running at http://localhost:${PORT}`);
  console.log(`\n📧 Test Email Configuration:`);
  console.log(`   TEST_EMAIL: ${TEST_EMAIL}`);
  console.log(`   (This email will always be the first panelist for testing)`);
  console.log(`\n📚 Available Endpoints:`);
  console.log(`   GET /api/health                    - Health check`);
  console.log(`   GET /api/v1/panel/filters          - Get filter options`);
  console.log(`   GET /api/v1/panel/users            - Get respondents`);
  console.log(`   GET /api/v1/panel/users/:hashId    - Get single respondent`);
  console.log(`   GET /api/v1/panel/profiles         - Get profiles`);
  console.log(`   GET /api/v1/panel/transactions     - Get transactions`);
  console.log(`   GET /api/v1/panel/activities       - Get activities`);
  console.log(`   GET /api/v1/panel/stats            - Get statistics`);
  console.log(`\n🔍 Filter Query Params (comma-separated for multiple):`);
  console.log(`   ?employmentStatus=Currently employed`);
  console.log(`   ?jobTitle=C-Level,VP+`);
  console.log(`   ?jobFunction=IT Decision Maker`);
  console.log(`   ?companySize=Enterprise (10K+)`);
  console.log(`   ?industry=Technology,Healthcare`);
  console.log(`   ?page=1&pageSize=20`);
  console.log(`\n📋 Example:`);
  console.log(`   http://localhost:${PORT}/api/v1/panel/users?industry=Technology&jobTitle=C-Level&page=1`);
});
