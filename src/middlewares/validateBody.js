import Joi from 'joi';
import createError from 'http-errors';

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(createError(400, error.details[0].message));
    } else {
      next();
    }
  };
};

export default validateBody;
