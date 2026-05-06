import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { createAuditLog } from '../utils/audit';
import { asyncHandler } from '../utils/asyncHandler';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      department: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Create audit log
  await createAuditLog(prisma, {
    eventType: 'LOGIN',
    entityType: 'User',
    entityId: user.id,
    performedById: user.id,
    details: { email, timestamp: new Date() }
  });

  // Return user data and access token
  res.json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  // Create audit log if user is authenticated
  if (req.user) {
    await createAuditLog(prisma, {
      eventType: 'LOGOUT',
      entityType: 'User',
      entityId: req.user.id,
      performedById: req.user.id,
      details: { timestamp: new Date() }
    });
  }

  res.json({ message: 'Logged out successfully' });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const { userId } = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const accessToken = generateAccessToken(user.id, user.role);

    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      department: {
        select: {
          id: true,
          name: true
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      departmentId: true,
      department: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});