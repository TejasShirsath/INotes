import { Request, Response } from 'express';
import User from '../models/User';
import catchAsync from '../middlewares/catchAsync';
import httpStatus from '../utils/httpStatus';

// Create user from Auth0 user data (no token verification needed)
export const createUserFromAuth0Data = catchAsync(async (req: Request, res: Response) => {
  const { auth0Id, email, name, picture } = req.body;

  console.log('👤 Auth0 User data received:', { auth0Id, email, name, picture });

  if (!auth0Id || !email) {
    console.log('❌ Missing required user data');
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Missing required user data (auth0Id or email)'
    });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { auth0Id },
        { email }
      ]
    });

    console.log('🔍 Existing user found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('➕ Creating new user...');
      // Create new user
      user = new User({
        name: name || email.split('@')[0],
        email,
        auth0Id,
        picture,
        provider: 'auth0'
      });
      await user.save();
      console.log('✅ User created successfully:', user._id);
    } else if (!user.auth0Id) {
      console.log('🔄 Updating existing local user with Auth0 info...');
      // Update existing local user with Auth0 info
      user.auth0Id = auth0Id;
      user.picture = picture;
      user.provider = 'auth0';
      if (name) user.name = name;
      await user.save();
      console.log('✅ User updated successfully');
    } else {
      console.log('👤 User already exists, returning existing user');
    }

    res.status(httpStatus.OK).json({
      message: 'User profile processed successfully',
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
    console.error('❌ Error in createUserFromAuth0Data:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Error processing user profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create or get Auth0 user profile
export const getOrCreateAuth0User = catchAsync(async (req: Request, res: Response) => {
  const auth0User = req.user;

  console.log('👤 Auth0 User received:', auth0User);

  if (!auth0User) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: 'No user data found in token'
    });
  }

  try {
    // Extract user info from Auth0 token (handle both ID tokens and access tokens)
    const auth0Id = auth0User.sub;
    const email = auth0User.email;
    const name = auth0User.name || auth0User.nickname || (email ? email.split('@')[0] : 'User');
    const picture = auth0User.picture;

    console.log('📝 Extracted user data:', { auth0Id, email, name, picture });

    if (!auth0Id || !email) {
      console.log('❌ Missing required user data');
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Missing required user data (sub or email)'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { auth0Id },
        { email }
      ]
    });

    console.log('🔍 Existing user found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('➕ Creating new user...');
      // Create new user
      user = new User({
        name,
        email,
        auth0Id,
        picture,
        provider: 'auth0'
      });
      await user.save();
      console.log('✅ User created successfully:', user._id);
    } else if (!user.auth0Id) {
      console.log('🔄 Updating existing local user with Auth0 info...');
      // Update existing local user with Auth0 info
      user.auth0Id = auth0Id;
      user.picture = picture;
      user.provider = 'auth0';
      await user.save();
      console.log('✅ User updated successfully');
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
    console.error('❌ Error in getOrCreateAuth0User:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Error processing user profile',
      error: error instanceof Error ? error.message : 'Unknown error'
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
