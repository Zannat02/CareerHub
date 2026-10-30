require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''));

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

let applications;


//  Validation 

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


const pickFields = (body = {}) => {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    out[key] = typeof body[key] === 'string' ? body[key].trim() : '';
  }
  return out;
};


const hasValidSignature = (buffer) => {
  const startsWith = (bytes) =>
    buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b);
  const pdf = startsWith([0x25, 0x50, 0x44, 0x46]); // %PDF
  const docx = startsWith([0x50, 0x4b, 0x03, 0x04]); // PK.. (zip)
  const doc = startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // OLE
  return pdf || docx || doc;
};



const normalizePhone = (phone) => phone.replace(/[\s\-().]/g, '');


const isValidPhone = (phone) =>
  /^\+[1-9]\d{6,14}$/.test(phone) || /^0\d{7,14}$/.test(phone);

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

   // phone
  if (!doc.phone) {
    errors.phone = 'Phone number is required.';
  } else if (!isValidPhone(normalizePhone(doc.phone))) {
    errors.phone =
      'Enter a valid phone number with country code (e.g. +8801712345678).';
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





// Create application

const RESUME_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE, files: 1 },
}).single('resume');


const uploadResume = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      let message = err.message;
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'Resume must be 5MB or smaller.';
      } else if (
        err.code === 'LIMIT_UNEXPECTED_FILE' ||
        err.code === 'LIMIT_FILE_COUNT'
      ) {
        message = 'Upload only one file using the field name "resume".';
      }
      return res
        .status(400)
        .send({ error: 'Validation failed', errors: { resume: message } });
    }
    next(err);
  });
};


const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const duplicateError = {
  error: 'You have already applied for this position with this email.',
  errors: { email: 'You have already applied for this position with this email.' },
};

app.post(
  '/applications',
  uploadResume,
  wrap(async (req, res) => {
    const doc = pickFields(req.body);

    // 1. Validation
    const errors = validate(doc, req.file);
    if (Object.keys(errors).length) {
      return res.status(400).send({ error: 'Validation failed', errors });
    }

    // 2. Data clean/normalize
    doc.email = doc.email.toLowerCase();
      doc.phone = normalizePhone(doc.phone);

    // 3. Duplicate check (same email + same position)
    const exists = await applications.findOne(
      { email: doc.email, position: doc.position },
      { projection: { _id: 1 } }
    );
    if (exists) return res.status(409).send(duplicateError);


    const ext = path.extname(req.file.originalname).toLowerCase();
    doc.resume = {
      filename: path.basename(req.file.originalname).slice(0, 100),
      contentType: RESUME_TYPES[ext],
      size: req.file.size,
      data: req.file.buffer,
    };
    doc.status = 'Pending';
    doc.createdAt = new Date();

    try {
      const result = await applications.insertOne(doc);
      res.status(201).send({
        message: 'Application submitted successfully.',
        applicationId: result.insertedId,
      });
    } catch (err) {

      if (err.code === 11000) return res.status(409).send(duplicateError);
      throw err;
    }
  })
);

app.get('/', (req, res) => {
  res.send('CareerHub server is running');
});

async function start() {
  await client.connect();
  applications = client.db('careerhubDB').collection('applications');
  await applications.createIndex({ email: 1, position: 1 }, { unique: true });
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



//Admin routes + error handlers


const requireAdmin = (req, res, next) => {
  const key = process.env.ADMIN_KEY;
  if (!key) {
    return res
      .status(503)
      .send({ error: 'Admin access is not configured on the server' });
  }
  const sent = Buffer.from(req.get('x-admin-key') || '');
  const real = Buffer.from(key);
  if (sent.length !== real.length || !crypto.timingSafeEqual(sent, real)) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  next();
};

const parseId = (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send({ error: 'Invalid application id' });
    return null;
  }
  return new ObjectId(req.params.id);
};


const withoutFile = { projection: { 'resume.data': 0 } };

app.get(
  '/applications',
  requireAdmin,
  wrap(async (req, res) => {
    const result = await applications
      .find({}, withoutFile)
      .sort({ _id: -1 })
      .toArray();
    res.send(result);
  })
);

app.get(
  '/applications/:id',
  requireAdmin,
  wrap(async (req, res) => {
    const _id = parseId(req, res);
    if (!_id) return;
    const application = await applications.findOne({ _id }, withoutFile);
    if (!application) {
      return res.status(404).send({ error: 'Application not found' });
    }
    res.send(application);
  })
);

app.get(
  '/applications/:id/resume',
  requireAdmin,
  wrap(async (req, res) => {
    const _id = parseId(req, res);
    if (!_id) return;
    const application = await applications.findOne(
      { _id },
      { projection: { resume: 1 } }
    );
    if (!application || !application.resume) {
      return res.status(404).send({ error: 'Resume not found' });
    }
    const { filename, contentType, data } = application.resume;
    res.attachment(filename);
    res.type(contentType);
    res.send(Buffer.from(data.buffer.subarray(0, data.length())));
  })
);

// 404 + global error handler  

app.use((req, res) => {
  res.status(404).send({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).send({ error: 'Invalid JSON body' });
  }
  res.status(500).send({ error: 'Internal server error' });
});