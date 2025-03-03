import express from 'express';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';
import authRouter from './routers/auth.js'; // ✅ Eksik olan auth router eklendi
import contactsRouter from './routers/contacts.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import initMongoConnection from './db/initMongoConnection.js'; // ✅ MongoDB bağlantısı eklendi

dotenv.config();

const setupServer = async () => {
  await initMongoConnection(); // ✅ MongoDB bağlantısını başlat

  const app = express();
  const logger = pino();

  app.use(cors());
  app.use(express.json());

  // ✅ API Rotaları
  app.use('/auth', authRouter); // 🛠 Auth rotası eklendi!
  app.use('/contacts', contactsRouter);

  // ✅ 404 ve hata yönetimi middleware'leri
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
  });
};

export default setupServer;
