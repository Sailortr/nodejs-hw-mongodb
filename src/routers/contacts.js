import express from 'express';
import authenticate from '../middlewares/authenticate.js'; // Kimlik doğrulama
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contacts.js';
import validateBody from '../middlewares/validateBody.js';
import isValidId from '../middlewares/isValidId.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contactValidation.js';

const router = express.Router();

router.get('/', authenticate, getContacts);
router.get('/:contactId', authenticate, isValidId, getContactById);
router.post(
  '/',
  authenticate,
  validateBody(createContactSchema),
  createContact,
);
router.patch(
  '/:contactId',
  authenticate,
  isValidId,
  validateBody(updateContactSchema),
  updateContact,
);
router.delete('/:contactId', authenticate, isValidId, deleteContact);

export default router;
