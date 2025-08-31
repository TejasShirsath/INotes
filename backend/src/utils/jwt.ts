import jwt from 'jsonwebtoken';

type AccessTokenPayload = {
  _id: string;
  email: string;
  name: string;
};

export const signAccessToken = (payload: Object) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const token = jwt.sign(payload, secret!, { expiresIn: '30d' });

  return token;
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  return jwt.verify(token, secret!) as AccessTokenPayload;
};
