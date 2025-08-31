import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import CaptureError from '../utils/CaptureError';
import httpStatus from '../utils/httpStatus';
import { verifyAccessToken } from '../utils/jwt';
import catchAsync from './catchAsync';

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader =
      req.headers.authorization ||
      (req.headers.Authorization as string | undefined);

    if (!authHeader?.startsWith('Bearer ')) {
      const message = 'No authorization token was found in the request header.';
      throw new CaptureError(message, httpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const { _id } = verifyAccessToken(token);

    const user = await User.findById(_id);

    if (!user) throw new CaptureError('User not found!', httpStatus.NOT_FOUND);

    req.user = user;

    next();
  }
);

export default protect;
