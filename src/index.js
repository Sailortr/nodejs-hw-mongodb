import initMongoConnection from './db/initMongoConnection.js';
import setupServer from './server.js';

export const start = async () => {
  await initMongoConnection();
  setupServer();
};

start();
