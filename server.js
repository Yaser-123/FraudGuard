// server.js - Secure Express server with enterprise-grade security
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import process from 'process';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { createWorker } from 'tesseract.js';
import { db, schema } from './db/db.js';
import { eq, desc } from 'drizzle-orm';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Security Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-in-production';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcCAOKFQmK4E.'; // "admin123"

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));

// CORS Configuration - Restrict to known origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your actual domain
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 authentication attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

const dispatchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 dispatch calls per 5 minutes
  message: 'Too many dispatch requests, please try again later.',
});

app.use('/api/', generalLimiter);
app.use('/api/admin/authenticate', authLimiter);
app.use('/api/dispatch-call', dispatchLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Configuration
const API_CONFIG = {
  API_KEY: "NpblrKWpgTWYufTA0sAQzDmezCxX-lXlk-6j0kblsL4",
  AGENT_ID: 2335,
  BASE_URL: "https://backend.omnidim.io/api/v1"
};

// Input validation middleware
const validateComplaintData = [
  body('complaintData.customer_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Customer name must be 2-100 characters and contain only letters and spaces'),
  body('complaintData.phone_number')
    .trim()
    .matches(/^\+?[\d\s\-()]{10,15}$/)
    .withMessage('Phone number must be valid (10-15 digits)'),
  body('complaintData.complaint_id')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('Complaint ID must be 3-50 characters and contain only letters, numbers, hyphens, and underscores'),
  body('complaintData.issue_summary')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Issue summary must be 10-1000 characters'),
  body('complaintData.fraud_message')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Fraud message must not exceed 5000 characters')
];

const validateAdminLogin = [
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be 6-100 characters')
];

// JWT Authentication Helper Functions
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Endpoint to process image and extract text (Real OCR using Tesseract.js)
app.post('/api/extract-text-from-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('Processing image for OCR:', req.file.originalname);
    
    // Create a Tesseract worker
    const worker = await createWorker('eng');
    
    try {
      // Perform OCR on the uploaded image
      const { data: { text } } = await worker.recognize(req.file.path);
      
      // Clean up the extracted text
      const cleanedText = text.trim();
      
      // Format the extracted text
      const extractedText = cleanedText ? 
        `[OCR EXTRACTED FROM: ${req.file.originalname}]\n\n${cleanedText}` :
        `[OCR EXTRACTED FROM: ${req.file.originalname}]\n\nNo readable text found in the image.`;

      console.log('OCR extraction successful');
      
      res.json({
        success: true,
        extractedText: extractedText
      });

    } catch (ocrError) {
      console.error('OCR processing error:', ocrError);
      res.status(500).json({
        success: false,
        error: 'Failed to extract text from image: ' + ocrError.message
      });
    } finally {
      // Terminate the worker to free up resources
      await worker.terminate();
    }

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    // Clean up uploaded file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log('Error deleting temp file:', err);
        else console.log('Temp file cleaned up:', req.file.path);
      });
    }
  }
});

// Endpoint to dispatch calls with validation
app.post('/api/dispatch-call', validateComplaintData, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { complaintData } = req.body;
    
    // Get client IP address
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     '127.0.0.1';
    
    // Get device info from user agent
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceInfo = {
      user_agent: userAgent,
      platform: 'Web Browser',
      source: 'Complaint Form App'
    };
    
    const payload = {
      agent_id: API_CONFIG.AGENT_ID,
      to_number: complaintData.phone_number,
      callInformation: {
        customer_name: complaintData.customer_name,
        complaint_id: complaintData.complaint_id,
        issue_summary: complaintData.issue_summary,
        timestamp: new Date().toISOString(),
        device_info: deviceInfo,
        ip_address: clientIP,
        ...(complaintData.fraud_message && { fraud_message: complaintData.fraud_message }),
        ...(complaintData.screenshot_url && { screenshot_url: complaintData.screenshot_url })
      }
    };

    console.log('Dispatching call with payload:', JSON.stringify(payload, null, 2));

    // First, save to database
    let dbRecord;
    try {
      dbRecord = await db.insert(schema.complaints).values({
        customerName: complaintData.customer_name,
        phoneNumber: complaintData.phone_number,
        complaintId: complaintData.complaint_id,
        issueSummary: complaintData.issue_summary,
        fraudMessage: complaintData.fraud_message || null,
        deviceInfo: deviceInfo,
        ipAddress: clientIP,
        screenshotPath: complaintData.screenshot_url || null,
        callDispatchSuccess: 'pending'
      }).returning();
      
      console.log('Complaint saved to database:', dbRecord[0]);
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue with API call even if DB save fails
    }

    // Then make the API call to OmniDimension
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_CONFIG.BASE_URL}/calls/dispatch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Update database record with failure
      if (dbRecord && dbRecord[0]) {
        await db.update(schema.complaints)
          .set({ 
            callDispatchSuccess: 'failed',
            omniResponseData: { error: errorText, status: response.status }
          })
          .where(eq(schema.complaints.id, dbRecord[0].id));
      }
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    // Update database record with success
    if (dbRecord && dbRecord[0]) {
      await db.update(schema.complaints)
        .set({ 
          callDispatchSuccess: 'success',
          omniResponseData: result
        })
        .where(eq(schema.complaints.id, dbRecord[0].id));
    }

    res.json({
      success: true,
      data: result,
      dbId: dbRecord ? dbRecord[0].id : null
    });

  } catch (error) {
    console.error('Error dispatching call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Complaint Form API Server is running' });
});

// Admin authentication endpoint with JWT
app.post('/api/admin/authenticate', validateAdminLogin, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: errors.array()
      });
    }

    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    // Verify password against hash
    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    if (!isValidPassword) {
      console.log(`Failed admin login attempt from IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Generate JWT token
    const token = generateToken({
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
    });
    
    console.log(`Admin authenticated from IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
    
    res.json({
      success: true,
      message: 'Authentication successful',
      token: token,
      expiresIn: '24h'
    });
    
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Middleware to verify JWT token for admin routes
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  try {
    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Get all complaints (Admin only)
app.get('/api/complaints', verifyAdminToken, async (req, res) => {
  try {
    const complaints = await db.select().from(schema.complaints).orderBy(desc(schema.complaints.createdAt));
    res.json({
      success: true,
      data: complaints,
      count: complaints.length
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single complaint by ID (Admin only)
app.get('/api/complaints/:id', verifyAdminToken, async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    
    if (isNaN(complaintId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid complaint ID'
      });
    }
    
    const complaint = await db.select().from(schema.complaints).where(eq(schema.complaints.id, complaintId));
    
    if (complaint.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }
    
    res.json({
      success: true,
      data: complaint[0]
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Complaint Form API Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});
