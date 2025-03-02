import Joi from 'joi';
import createError from 'http-errors';

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((err) => err.message);
      next(createError(400, errorMessages.join(', ')));
    } else {
      next();
    }
  };
};

export default validateBody;
