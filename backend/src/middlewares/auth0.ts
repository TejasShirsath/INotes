import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

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

export const verifyAuth0Token = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  console.log('🔑 Auth0 Token received:', token ? 'Yes' : 'No');
  console.log('🔧 AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  // Decode token to check its structure first
  const decodedToken = jwt.decode(token, { complete: true });
  console.log('🔍 Token structure:', decodedToken?.header, decodedToken?.payload);

  // For ID tokens (which is what we get without custom audience), verify with more flexible options
  jwt.verify(token, getKey, {
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
    // Remove audience check for ID tokens
  }, (err, decoded) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      console.log('❌ Full error:', err);
      return res.status(401).json({ error: 'Invalid token', details: err.message });
    }

    console.log('✅ Token verified successfully');
    console.log('👤 User info:', decoded);
    req.user = decoded;
    next();
  });
};
