import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectDatabase = async (): Promise<void> => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await pool.connect();
      console.log('PostgreSQL connected successfully');
      return;
    } catch (error) {
      retries++;
      console.error(`Database connection failed, retrying (${retries}/${maxRetries})...`, error);
      
      if (retries === maxRetries) {
        throw new Error('Failed to connect to the database after multiple attempts');
      }
      
      await new Promise(res => setTimeout(res, 3000));
    }
  }
};
