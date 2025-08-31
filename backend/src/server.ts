import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import httpLogger from 'morgan';
import connectDB from './config/db';
import errorHandler from './middlewares/errorHandler';
import usersRoutes from './routes/users';
import notesRoutes from './routes/notes';
import auth0Routes from './routes/auth0';
dotenv.config();

/* CONFIGURATION */
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

server.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list or matches Vercel pattern
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
server.use(helmet());
server.use(httpLogger('dev'));

/* ROUTES */
const baseUrl = process.env.BASE_API_URL || '/api';
server.get(baseUrl, (_, res) => {
  return res.json({ success: true, message: 'The server is up' });
});

// Test endpoint without authentication
server.get(baseUrl + '/test', (_, res) => {
  return res.json({ success: true, message: 'Backend is working!', timestamp: new Date() });
});

server.use(baseUrl + '/auth0', auth0Routes);
server.use(baseUrl, usersRoutes);
server.use(baseUrl, notesRoutes);
server.use(errorHandler);

connectDB();

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log('Server is listening at port: ', port);
});
