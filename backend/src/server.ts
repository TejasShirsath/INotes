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
server.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add frontend URLs
  credentials: true 
}));
server.use(helmet());
server.use(httpLogger('dev'));

/* ROUTES */
const baseUrl = process.env.BASE_API_URL || '/api';
server.get(baseUrl, (_, res) => {
  return res.json({ success: true, message: 'The server is up' });
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
