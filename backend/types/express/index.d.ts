import { UserSchema } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: UserSchema;
    }
  }
}
