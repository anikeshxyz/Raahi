import app from './src/app.js';
import { config } from './src/config/index.js';
import { connectDB } from './src/config/db.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`[Server] Raahi Café API running on port ${PORT} in ${config.nodeEnv} mode`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();
