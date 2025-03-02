import initMongoConnection from './db/initMongoConnection.js';
import setupServer from './server.js';
import dotenv from 'dotenv';
dotenv.config();

export const start = async () => {
  await initMongoConnection();
  setupServer();
};

start();
