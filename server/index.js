require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));


const uri = `mongodb+srv://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(
  process.env.DB_PASS
)}@cluster0booklibraryclus.5awlu0q.mongodb.net/?retryWrites=true&w=majority&appName=careerhub`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let applications; // DB connect hoyar por set hobe (Phase 3 e use hobe)


// ---------- Validation (Phase 2) ----------

const POSITIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'QA Engineer',
  'DevOps Engineer',
];

const ALLOWED_FIELDS = [
  'fullName',
  'email',
  'phone',
  'position',
  'availableFrom',
  'message',
];

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// Shudhu allowed field nibe, string hole trim korbe
const pickFields = (body = {}) => {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    out[key] = typeof body[key] === 'string' ? body[key].trim() : '';
  }
  return out;
};

// File er shuru'r byte dekhe asol type check (extension bypass thekate)
const hasValidSignature = (buffer) => {
  const startsWith = (bytes) =>
    buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b);
  const pdf = startsWith([0x25, 0x50, 0x44, 0x46]); // %PDF
  const docx = startsWith([0x50, 0x4b, 0x03, 0x04]); // PK.. (zip)
  const doc = startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // OLE
  return pdf || docx || doc;
};

const isRealDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
};


const validate = (doc, file) => {
  const errors = {};

  // Full name
  if (!doc.fullName) {
    errors.fullName = 'Full name is required.';
  } else if (doc.fullName.length < 3 || doc.fullName.length > 60) {
    errors.fullName = 'Full name must be between 3 and 60 characters.';
  } else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(doc.fullName)) {
    errors.fullName =
      'Full name can only contain letters, spaces, dots, hyphens and apostrophes.';
  }

  // Email
  if (!doc.email) {
    errors.email = 'Email address is required.';
  } else if (
    doc.email.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(doc.email)
  ) {
    errors.email = 'Please enter a valid email address.';
  }

  // Phone (Bangladesh)
  if (!doc.phone) {
    errors.phone = 'Phone number is required.';
  } else if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(doc.phone.replace(/[\s-]/g, ''))) {
    errors.phone =
      'Enter a valid Bangladeshi phone number (e.g. +8801XXXXXXXXX).';
  }

  // Position
  if (!doc.position) {
    errors.position = 'Please select a position.';
  } else if (!POSITIONS.includes(doc.position)) {
    errors.position = 'Please select a valid position from the list.';
  }

  // Available from (date)
  if (!doc.availableFrom) {
    errors.availableFrom = 'Please select a date.';
  } else if (!isRealDate(doc.availableFrom)) {
    errors.availableFrom = 'Please enter a valid date (YYYY-MM-DD).';
  } else {
    const today = new Date().toISOString().slice(0, 10);
    const max = new Date();
    max.setUTCFullYear(max.getUTCFullYear() + 1);
    if (doc.availableFrom < today) {
      errors.availableFrom = 'Available date cannot be in the past.';
    } else if (doc.availableFrom > max.toISOString().slice(0, 10)) {
      errors.availableFrom = 'Available date must be within the next 12 months.';
    }
  }

  // Message
  if (!doc.message) {
    errors.message = 'This field is required.';
  } else if (doc.message.length < 20) {
    errors.message = 'Please write at least 20 characters.';
  } else if (doc.message.length > 500) {
    errors.message = 'Message cannot exceed 500 characters.';
  }

  // Resume (file)
  if (!file) {
    errors.resume = 'Please upload your resume.';
  } else {
    const name = (file.originalname || '').toLowerCase();
    if (!RESUME_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      errors.resume = 'Resume must be a PDF, DOC or DOCX file.';
    } else if (file.size === 0) {
      errors.resume = 'The uploaded resume file is empty.';
    } else if (file.size > MAX_RESUME_SIZE) {
      errors.resume = 'Resume must be 5MB or smaller.';
    } else if (!hasValidSignature(file.buffer)) {
      errors.resume =
        'The file content does not match a valid PDF, DOC or DOCX file.';
    }
  }

  return errors;
};

app.get('/', (req, res) => {
  res.send('CareerHub server is running');
});

async function start() {
  await client.connect();
  applications = client.db('careerhubDB').collection('applications');
  await client.db('admin').command({ ping: 1 });
  console.log('Pinged your deployment. You successfully connected to MongoDB!');

  app.listen(port, () => {
    console.log(`CareerHub server is running on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});