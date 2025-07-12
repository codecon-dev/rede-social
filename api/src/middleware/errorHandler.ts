import { Request, Response, NextFunction } from 'express';

/**
 * Error handling middleware for Express.
 * This middleware catches errors thrown in the application and formats them into a JSON response.
 * It handles specific error codes and provides a generic error response for unhandled errors.
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  if (error.code === '23505') {
    res.status(409).json({
      error: 'Resource already exists',
      details: 'This record already exists in the database'
    });
    return;
  }

  if (error.code === '23503') {
    res.status(400).json({
      error: 'Invalid reference',
      details: 'Referenced resource does not exist'
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation failed',
      details: error.message
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};
