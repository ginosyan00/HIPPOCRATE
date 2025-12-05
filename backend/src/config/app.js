import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application Configuration
 */
export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};

// Validate critical config
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is required in environment variables');
}

if (config.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

