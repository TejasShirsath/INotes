import express from 'express';
import { getOrCreateAuth0User, getProfile } from '../controllers/auth0';
import { verifyAuth0Token } from '../middlewares/auth0';

const router = express.Router();

// Protected routes - require Auth0 token
router.use(verifyAuth0Token);

// Get or create user profile from Auth0 token
router.post('/profile', getOrCreateAuth0User);

// Get current user profile
router.get('/profile', getProfile);

export default router;
