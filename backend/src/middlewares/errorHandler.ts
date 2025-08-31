import { ErrorRequestHandler } from 'express';
import { Error } from 'mongoose';
import CaptureError from '../utils/CaptureError';
import httpStatus from '../utils/httpStatus';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose error for duplicate field value.
  if (error.code === 11000) {
    const key = Object.keys(err.keyValue || {})[0];
    const value = (err.keyValue as { [key: string]: any })[
      Object.keys(err.keyPattern || {})[0]
    ];

    let message = `A field value already exists. Field: "${key}", Value: "${value}"`;
    if (key === 'email') message = `${value} is already registered!`;
    error = new CaptureError(message, httpStatus.BAD_REQUEST);
  }

  // Mongoose error for validation of data.
  if (err instanceof Error.ValidationError) {
    let message = (error as Error & { errors: any }).errors?.[
      Object.keys(err.errors || {})[0]
    ].message;
    if (!message) message = error.message;
    error = new CaptureError(message, httpStatus.BAD_REQUEST);
  }

  // Mongoose error for failed to cast invalid ObjectIds.
  if (err.name === 'CastError') {
    const message = `${error.message}. ${err.reason}`;
    error = new CaptureError(message, httpStatus.BAD_REQUEST);
  }

  if (err.name === 'TokenExpiredError')
    error = new CaptureError('JWT has expired!', httpStatus.FORBIDDEN);

  if (err.name === 'JsonWebTokenError')
    error = new CaptureError(error.message, httpStatus.UNAUTHORIZED);

  const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message =
    error.message || 'Unexpected error occurred! Internal server error!';

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

export default errorHandler;
