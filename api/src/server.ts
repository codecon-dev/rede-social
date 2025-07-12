import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { config } from './config/config';
import { connectDatabase } from './config/database';

const startServer = async () => {
  try {
    await connectDatabase();
    console.log('Database connected successfully');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();