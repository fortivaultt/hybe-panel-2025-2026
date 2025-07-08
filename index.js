const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 3000;

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "https://logotyp.us"],
      connectSrc: ["'self'", "https://hybe-panel.onrender.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? ["https://hybecorp-permitvalidator.vercel.app", "https://hybe-panel.onrender.com"]
    : true,
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip}`);
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Enhanced rate limiting
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + req.headers["user-agent"],
});

const apiLimiter = createRateLimiter(60 * 1000, 3, "Rate limit exceeded. Please wait before trying again.");

// Input validation middleware
const validateSubscriptionId = (req, res, next) => {
  const { subscription_id } = req.body;
  
  if (!subscription_id) {
    return res.status(400).json({ 
      success: false, 
      message: "Subscription ID is required.",
      error_code: "MISSING_SUBSCRIPTION_ID"
    });
  }
  
  const validPattern = /^[A-Z0-9]{10,20}$/;
  if (!validPattern.test(subscription_id)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid subscription ID format.",
      error_code: "INVALID_FORMAT"
    });
  }
  
  next();
};

// Updated subscriptions database with 30-day expiration
const subscriptions = {
  "HYB07280EF6207": {
    subscription_id: "HYB07280EF6207",
    created_at: "2024-12-31",
    last_accessed: null,
    access_count: 0,
    ip_whitelist: [],
    Full_name: "ANEETA VARGHESE",
    Date_of_Birth: "1985-11-03",
    Country: "India",
    Status: "Active",
    Activation_Date: "2024-12-31",
    Expiration_Date: "2025-01-30", // 30 days from Activation_Date
    HYBE_License_PIN: "*********",
    HYBE_Chat_License_info: "[ON HOLD]",
    HYBE_License_Status: "[ACTION REQUIRED] Kindly upgrade your subscription ID to HYBE-GOLDEN to access your HYBE License PIN",
    Current_ID_Level: "[BASIC LV 1]",
    HYBE_GOLDEN_Upgrade_fee: "$5,670 USDT",
    Email: "aneetatheresa@gmail.com"
  },
  "HYBRUS07280EF6207": {
    subscription_id: "HYBRUS07280EF6207",
    created_at: "2025-01-07",
    last_accessed: null,
    access_count: 0,
    ip_whitelist: [],
    Full_name: "ALYONA MISHINA",
    Date_of_Birth: "1980-08-09",
    Country: "Russia",
    Status: "Active",
    Activation_Date: "2025-01-07",
    Expiration_Date: "2025-02-06", // 30 days from Activation_Date
    HYBE_License_PIN: "*********",
    HYBE_Chat_License_info: "[ON HOLD]",
    HYBE_License_Status: "[ACTION REQUIRED] Kindly upgrade your subscription ID to HYBE-GOLDEN to access your HYBE License PIN",
    Current_ID_Level: "[BASIC LV 1]",
    HYBE_GOLDEN_Upgrade_fee: "$3,670 USDT",
    Email: "aneetatheresa@gmail.com"
  },
  "HYB10250GB0680": {
    subscription_id: "HYB10250GB0680",
    created_at: "2025-06-23",
    last_accessed: null,
    access_count: 0,
    ip_whitelist: [],
    Full_name: "M Elisabete F Magalhaes",
    Date_of_Birth: "1980-06-30",
    Country: "United Kingdom",
    Status: "Active",
    Activation_Date: "2025-06-23",
    Expiration_Date: "2025-07-23", // 30 days from Activation_Date
    HYBE_License_PIN: "*********",
    HYBE_Chat_License_info: "[ON HOLD]",
    HYBE_License_Status: "[ACTION REQUIRED] Kindly upgrade your subscription ID to HYBE-GOLDEN to access your HYBE License PIN",
    Current_ID_Level: "[BASIC LV 1]",
    HYBE_GOLDEN_Upgrade_fee: "£10,800.02",
    Email: "bettamagalhaes@gmail.com"
  },
  "HYB59371A4C9F2": {
    subscription_id: "HYB59371A4C9F2",
    created_at: "2025-06-24T00:00:00Z",
    last_accessed: null,
    access_count: 0,
    ip_whitelist: [],
    Full_name: "MEGHANA VAISHNAVI",
    Date_of_Birth: "1995-05-25",
    Country: "India",
    Status: "Active",
    Activation_Date: "2025-06-24T00:00:00Z",
    Expiration_Date: "2025-07-24T00:00:00Z", // 30 days from Activation_Date
    HYBE_License_PIN: "*********",
    HYBE_Chat_License_info: "[ON HOLD]",
    HYBE_License_Status: "[ACTION REQUIRED] Kindly upgrade your subscription ID to HYBE-GOLDEN to access your HYBE License PIN",
    Current_ID_Level: "[BASIC LV 1]",
    HYBE_GOLDEN_Upgrade_fee: "$21,670 USDT",
    Email: "vaishnavimeghana3@gmail.com"
  },
};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Route for the root URL, serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Enhanced verification endpoint
app.post("/verify", apiLimiter, validateSubscriptionId, async (req, res) => {
  const subscriptionId = req.body.subscription_id;
  const clientIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const timestamp = new Date().toISOString();

  try {
    const subscription = subscriptions[subscriptionId];

    if (subscription) {
      // Update access tracking
      subscription.last_accessed = timestamp;
      subscription.access_count = (subscription.access_count || 0) + 1;
      
      // Security logging
      console.log(`[VERIFICATION SUCCESS] ID: ${subscriptionId} | IP: ${clientIp} | Time: ${timestamp}`);
      
      // Generate session token
      const sessionToken = crypto.randomBytes(32).toString("hex");
      
      return res.status(200).json({
        success: true,
        session_token: sessionToken,
        server_time: timestamp,
        verification_id: crypto.randomUUID(),
        ...subscription
      });
    } else {
      // Security logging for failed attempts
      console.log(`[VERIFICATION FAILED] ID: ${subscriptionId} | IP: ${clientIp} | Time: ${timestamp} | UA: ${userAgent}`);
      
      return res.status(401).json({ 
        success: false, 
        message: "Invalid subscription credentials. Please verify your subscription ID.",
        error_code: "INVALID_SUBSCRIPTION",
        support_reference: crypto.randomUUID().substring(0, 8).toUpperCase()
      });
    }
  } catch (error) {
    console.error(`[SYSTEM ERROR] ${error.message} | IP: ${clientIp} | Time: ${timestamp}`);
    return res.status(500).json({
      success: false,
      message: "System temporarily unavailable. Please try again later.",
      error_code: "SYSTEM_ERROR"
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "operational",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    uptime: process.uptime()
  });
});

// System status endpoint
app.get("/api/status", (req, res) => {
  res.status(200).json({
    service: "HYBE-CORP Subscription Validation Service",
    status: "active",
    maintenance_mode: false,
    last_update: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR HANDLER] ${err.stack}`);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    error_code: "INTERNAL_SERVER_ERROR"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    error_code: "NOT_FOUND"
  });
});

// Listener
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log("Open your Replit web view to see the application.");
});