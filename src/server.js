import express from 'express';
import cors from 'cors';
import pino from 'pino';
import contactsRouter from './routers/contacts.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

const setupServer = () => {
  const app = express();
  const logger = pino();

  app.use(cors());
  app.use(express.json());

  app.use('/contacts', contactsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

export default setupServer;
