import { Request, Response } from 'express';
import User from '../models/User';
import catchAsync from '../middlewares/catchAsync';
import httpStatus from '../utils/httpStatus';

// Create or get Auth0 user profile
export const getOrCreateAuth0User = catchAsync(async (req: Request, res: Response) => {
  const auth0User = req.user;

  if (!auth0User) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: 'No user data found in token'
    });
  }

  try {
    // Extract user info from Auth0 token
    const { sub: auth0Id, email, name, picture } = auth0User;

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { auth0Id },
        { email }
      ]
    });

    if (!user) {
      // Create new user
      user = new User({
        name: name || email.split('@')[0],
        email,
        auth0Id,
        picture,
        provider: 'auth0'
      });
      await user.save();
    } else if (!user.auth0Id) {
      // Update existing local user with Auth0 info
      user.auth0Id = auth0Id;
      user.picture = picture;
      user.provider = 'auth0';
      await user.save();
    }

    res.status(httpStatus.OK).json({
      message: 'User profile retrieved successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in getOrCreateAuth0User:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Error processing user profile'
    });
  }
});

// Get current user profile
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const auth0User = req.user;

  if (!auth0User) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: 'No user data found in token'
    });
  }

  try {
    const { sub: auth0Id, email } = auth0User;

    const user = await User.findOne({ 
      $or: [
        { auth0Id },
        { email }
      ]
    }).select('-password');

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found'
      });
    }

    res.status(httpStatus.OK).json({
      message: 'User profile retrieved successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving user profile'
    });
  }
});
