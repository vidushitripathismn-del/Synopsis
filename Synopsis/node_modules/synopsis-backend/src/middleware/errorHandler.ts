import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.reduce((acc, err) => {
      const field = err.path.join('.');
      acc[field] = err.message;
      return acc;
    }, {} as Record<string, string>);

    return res.status(400).json({
      error: 'Validation failed',
      fieldErrors
    });
  }

  // Prisma unique constraint violation
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        error: `${field} already exists`
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Record not found'
      });
    }
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
};