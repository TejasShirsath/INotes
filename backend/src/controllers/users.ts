import catchAsync from '../middlewares/catchAsync';
import User from '../models/User';
import CaptureError from '../utils/CaptureError';
import httpStatus from '../utils/httpStatus';
import { signAccessToken } from '../utils/jwt';
import {
  validateLoginData,
  validateUserRegisterData,
} from '../validations/users';

/**
 * @route   /users/register
 * @method  POST
 * @access  Public
 * @desc    Register a user.
 */
export const registerUser = catchAsync(async (req, res, next) => {
  const { data: userData, error } = await validateUserRegisterData(req.body);
  if (error)
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      error,
    });

  const user = await User.findOne({ email: userData.email });
  if (user) {
    const message = 'User is already registered with this email';
    throw new CaptureError(message, httpStatus.BAD_REQUEST);
  }

  const newUser = new User(userData);
  await newUser.save();

  const userPayload = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
  };
  const accessToken = signAccessToken(userPayload);
  res.header('x-access-token', accessToken);

  return res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User registration successful',
    user: { ...userPayload, accessToken },
  });
});

/**
 * @route   /users/login
 * @method  POST
 * @access  Public
 * @desc    Login a user by returning JWT.
 */
export const loginUser = catchAsync(async (req, res, next) => {
  const { data: userData, error } = await validateLoginData(req.body);
  if (error)
    return res.json({
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      error,
    });

  const user = await User.findOne({ email: userData.email });
  if (!user) throw new CaptureError('User not found!', httpStatus.NOT_FOUND);

  const passwordMatch = await user.isCorrectPassword(userData.password);
  if (!passwordMatch)
    throw new CaptureError('Incorrect password!', httpStatus.BAD_REQUEST);

  const userPayload = { _id: user._id, name: user.name, email: user.email };
  const accessToken = signAccessToken(userPayload);
  res.header('x-access-token', accessToken);

  return res.json({
    success: true,
    statusCode: httpStatus.OK,
    user: { ...userPayload, accessToken },
    message: 'User login successful',
  });
});
