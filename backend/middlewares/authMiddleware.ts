import jwt from 'jsonwebtoken';
import { asyncHandler } from '.';
import { User } from '../models';
import { NextFunction, Response } from 'express';
import { IUser } from '../interfaces';

// User must be authenticated
const protect = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;

      try {
        const decoded = jwt.verify(
          token as string,
          process.env.JWT_SECRET || ''
        ) as jwt.JwtPayload;

        req.user = (await User.findById(decoded.userId).select(
          '-password'
        )) as IUser;

        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    } else {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
  }
);

// User must be an admin
const admin = (req: any, res: Response, next: NextFunction) => {
  if (req.user && (req.user as IUser).roles.includes('admin')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };
