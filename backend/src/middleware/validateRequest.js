'use strict';

const ApiError = require('../utils/ApiError');

const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema || typeof schema.validate !== 'function') return next();
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
      throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details);
    }
    if (property === 'query') {
      try {
        req.query = value;
      } catch (e) {
        // Express 5 query getter
        Object.keys(req.query).forEach(k => delete req.query[k]);
        Object.assign(req.query, value);
      }
    } else {
      req[property] = value;
    }
    next();
  };
};

module.exports = validateRequest;
