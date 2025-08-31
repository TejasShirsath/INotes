import { UserSchema } from '../../src/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: UserSchema | any; // Auth0 user object
    }
  }
}
