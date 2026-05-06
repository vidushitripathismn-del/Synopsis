import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export const generateAccessToken = (userId: string, role: Role): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as { userId: string };
};