import express from 'express';
import { getOrCreateAuth0User, getProfile, createUserFromAuth0Data } from '../controllers/auth0';
import { verifyAuth0Token } from '../middlewares/auth0';

const router = express.Router();

// Public route - create user from Auth0 data (no token verification)
router.post('/profile', createUserFromAuth0Data);

// Protected routes - require Auth0 token
router.use(verifyAuth0Token);

// Get or create user profile from Auth0 token (legacy)
router.post('/profile-token', getOrCreateAuth0User);

// Get current user profile
router.get('/profile', getProfile);

export default router;
