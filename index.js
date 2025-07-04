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
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://hybecorp-permitvalidator.vercel.app"
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

// Enhanced rate limiting with different tiers
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + req.headers["user-agent"], // More specific tracking
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
  
  // Enhanced validation pattern
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

// Enhanced subscription database with additional professional fields
const subscriptions = {
    "HYB07280EF6207": {
        "subscription_id": "HYB07280EF6207",
        "created_at": "2024-12-31T00:00:00Z",
        "last_accessed": null,
        "access_count": 0,
        "ip_whitelist": [],
        "Full_name": "<span style='font-weight: bold;'>ANEETA VARGHESE</span>",
        "Date_of_Birth": "Nov 3, 19**",
        "Country": "India",
        "Status": "<span style='color: green; font-weight: bold;'>Active</span>",
        "Activation_Date": "<span style='font-weight: bold;'>Dec 31, 2024</span>",
        "Expiration_Date": "<span style='font-weight: bold;'>Dec 31, 2025</span>",
        "HYBE_License_PIN": "*********",
        "HYBE_Chat_License_info": "<span style='color: red; font-weight: bold;'>[ ON HOLD ]</span>",
        "HYBE_License_Status": " <span style='color: red; font-weight: bold;'>[ACTION REQUIRED]</span> Kindly Upgrade your subscription ID to <span style='font-weight: bold;'>HYBE-GOLDEN</span> to access your <span style='font-weight: bold;'>HYBE License PIN</span>",
        "Current_ID_Level": "<span style='color: red; font-weight: bold;'>[BASIC LV 1]</span>",
        "HYBE_GOLDEN_Upgrade_fee": "<span style='color: red; font-weight: bold;'>[ $5,670 USDT ]</span>",
        "Email": "aneetatheresa@gmail.com"
    },
    "HYBRUS07280EF6207": {
        "Full_name": "<span style='font-weight: bold;'>ALYONA MISHINA</span>",
        "Date_of_Birth": "Aug 09, 19**",
        "Country": "Russia",
        "Status": "<span style='color: green; font-weight: bold;'>Active</span>",
        "Activation_Date": "<span style='font-weight: bold;'>Jan 07, 2025</span>",
        "Expiration_Date": "<span style='font-weight: bold;'>Jan 07, 2026</span>",
        "HYBE_License_PIN": "*********",
        "HYBE_Chat_License_info": "<span style='color: red; font-weight: bold;'>[ ON HOLD ]</span>",
        "HYBE_License_Status": " <span style='color: red; font-weight: bold;'>[ACTION REQUIRED]</span> Kindly Upgrade your subscription ID to <span style='font-weight: bold;'>HYBE-GOLDEN</span> to access your <span style='font-weight: bold;'>HYBE License PIN</span>",
        "Current_ID_Level": "<span style='color: red; font-weight: bold;'>[BASIC LV 1]</span>",
        "HYBE_GOLDEN_Upgrade_fee": "<span style='color: red; font-weight: bold;'>[ $3,670 USDT ]</span>",
        "Email": "aneetatheresa@gmail.com"
    },
    "HYB10250GB0680": {
        "Full_name": "<span style='font-weight: bold;'>M Elisabete F Magalhaes</span>",
        "Date_of_Birth": "1980-06-30",
        "Country": "United Kingdom",
        "Status": "<span style='color: green; font-weight: bold;'>Active</span>",
        "Activation_Date": "<span style='font-weight: bold;'>June 10, 2025</span>",
        "Expiration_Date": "<span style='font-weight: bold;'>June 10, 2026</span>",
        "HYBE_License_PIN": "*********",
        "HYBE_Chat_License_info": "<span style='color: red; font-weight: bold;'>[ ON HOLD ]</span>",
        "HYBE_License_Status": " <span style='color: red; font-weight: bold;'>[ACTION REQUIRED]</span> Kindly Upgrade your subscription ID to <span style='font-weight: bold;'>HYBE-GOLDEN</span> to access your HYBE Profile<span style='font-weight: bold;'>HYBE License PIN</span>",
        "Current_ID_Level": "<span style='color: red; font-weight: bold;'>[BASIC LV 1]</span>",
        "HYBE_GOLDEN_Upgrade_fee": "<span style='color: red; font-weight: bold;'>[ £27,831.02 ]</span>",
        "Email": "bettamagalhaes@gmail.com"
    },
    "HYB59371A4C9F2": {
        "subscription_id": "HYB59371A4C9F2",
        "created_at": "2025-06-24T00:00:00Z",
        "last_accessed": null,
        "access_count": 0,
        "ip_whitelist": [],
        "Full_name": "<span style='font-weight: bold;'>MEGHANA VAISHNAVI</span>",
        "Date_of_Birth": "May 25, 1995",
        "Country": "India",
        "Status": "<span style='color: green; font-weight: bold;'>Active</span>",
        "Activation_Date": "<span style='font-weight: bold;'>Jun 24, 2025</span>",
        "Expiration_Date": "<span style='font-weight: bold;'>Jun 24, 2026</span>",
        "HYBE_License_PIN": "*********",
        "HYBE_Chat_License_info": "<span style='color: red; font-weight: bold;'>[ ON HOLD ]</span>",
        "HYBE_License_Status": " <span style='color: red; font-weight: bold;'>[ACTION REQUIRED]</span> Kindly Upgrade your subscription ID to <span style='font-weight: bold;'>HYBE-GOLDEN</span> to access your <span style='font-weight: bold;'>HYBE License PIN</span>",
        "Current_ID_Level": "<span style='color: red; font-weight: bold;'>[BASIC LV 1]</span>",
        "HYBE_GOLDEN_Upgrade_fee": "<span style='color: red; font-weight: bold;'>[ $21,670 USDT ]</span>",
        "Email": "vaishnavimeghana3@gmail.com"
    },
};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Route for the root URL, serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Enhanced verification endpoint with comprehensive logging and security
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
      
      // Generate session token for additional security
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

// Health check endpoint for monitoring
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
    last_update: "2025-01-07T12:00:00Z"
  });
});

// Listener
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log("Open your Replit web view to see the application.");
});
