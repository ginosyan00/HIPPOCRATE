import app from './app.js';
import { config } from './config/app.js';
import { prisma } from './config/database.js';

/**
 * Start Server
 */
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start listening
    app.listen(config.port, () => {
      console.log('');
      console.log('🦷 Hippocrates Dental API');
      console.log(`📡 Server running on http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`✅ Health check: http://localhost:${config.port}/health`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start
startServer();

