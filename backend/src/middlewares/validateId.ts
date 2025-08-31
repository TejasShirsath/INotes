import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import CaptureError from '../utils/CaptureError';
import httpStatus from '../utils/httpStatus';

interface Params {
  [x: string]: any;
}

const validateId = (key: string) => {
  return (req: Request<Params>, res: Response, next: NextFunction) => {
    const objectId = req.params[key];
    if (!isValidObjectId(objectId)) {
      const message = `Id ${objectId} in url parameter is not a valid object id`;
      return next(new CaptureError(message, httpStatus.BAD_REQUEST));
    }

    next();
  };
};

export default validateId;
