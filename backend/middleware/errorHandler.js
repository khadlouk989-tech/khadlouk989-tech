const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.code === 'P2002') {
    const message = `${err.meta.target.join(', ')} already exists`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidationError' || err.name === 'BadRequestError') {
    error = new ErrorResponse(err.message, 400);
  }

  if (err.name === 'UnauthorizedError') {
    error = new ErrorResponse('Not authorized', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
