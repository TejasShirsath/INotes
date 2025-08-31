import { Response, NextFunction } from 'express';
import * as core from 'express-serve-static-core';

interface Request<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>
> extends core.Request<P, ResBody, ReqBody, ReqQuery, Locals> {}

const catchAsync = (
  callback: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch((err: Error) => {
      next(err);
    });
  };
};

export default catchAsync;
