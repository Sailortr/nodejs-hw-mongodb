import mongoose from 'mongoose';
import createError from 'http-errors';

const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return next(createError(400, 'Invalid contact ID'));
  }
  next();
};

export default isValidId;
