import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import User from '../models/User';
import CaptureError from '../utils/CaptureError';
import httpStatus from '../utils/httpStatus';

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Universal authentication middleware that supports both local JWT and Auth0 tokens
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({ 
      success: false,
      message: 'No token provided' 
    });
  }

  try {
    // Try to decode the token to determine if it's Auth0 or local
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    // Check if it's an Auth0 token (has 'iss' field pointing to Auth0)
    if (decoded.payload && typeof decoded.payload === 'object' && 
        'iss' in decoded.payload && 
        decoded.payload.iss === `https://${process.env.AUTH0_DOMAIN}/`) {
      
      // Handle Auth0 token
      jwt.verify(token, getKey, {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
      }, async (err, auth0User: any) => {
        if (err) {
          return res.status(httpStatus.UNAUTHORIZED).json({ 
            success: false,
            message: 'Invalid Auth0 token' 
          });
        }

        try {
          // Find or create user based on Auth0 data
          const { sub: auth0Id, email } = auth0User;
          
          let user = await User.findOne({ 
            $or: [
              { auth0Id },
              { email }
            ]
          });

          if (!user) {
            // Create new user if doesn't exist
            user = new User({
              name: auth0User.name || email.split('@')[0],
              email,
              auth0Id,
              picture: auth0User.picture,
              provider: 'auth0'
            });
            await user.save();
          }

          req.user = user;
          next();
        } catch (error) {
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            success: false,
            message: 'Error processing Auth0 user' 
          });
        }
      });
    } else {
      // Handle local JWT token
      try {
        const localUser = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(localUser.user_id);

        if (!user) {
          throw new CaptureError('User does not exist', httpStatus.UNAUTHORIZED);
        }

        req.user = user;
        next();
      } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({ 
          success: false,
          message: 'Invalid local token' 
        });
      }
    }
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({ 
      success: false,
      message: 'Token verification failed' 
    });
  }
};
