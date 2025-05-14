import { IUser } from '../interfaces';
import { asyncHandler } from '../middlewares';
import { User } from '../models';
import generateToken from '../utils/generateToken';
import { Request, Response } from 'express';

// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await (user as any).matchPassword(password))) {
    generateToken(res, user._id as string);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      profileImage: user.profileImage,
    } as IUser);
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists && !userExists.archived) {
      res.status(400);
      throw new Error('User already exists');
    }

    // TO DO - This could be problematic as it might overwrite important historical data unintentionally.
    // Consider the implications of reusing archived user accounts.

    if (userExists && userExists.archived) {
      // If user exists but is archived, unarchive and update other fields
      userExists.archived = false;
      userExists.name = name;
      userExists.phone = phone;
      // put other fields to empty
      userExists.roles = ['user'];
      userExists.createdAt = new Date();

      await userExists.save();

      res.status(201).json({
        _id: userExists._id,
        name: userExists.name,
        phone: userExists.phone,
        email: userExists.email,
        roles: userExists.roles,
        profileImage: userExists.profileImage,
      });
    }

    const user: IUser = await User.create({
      name,
      email,
      password,
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid user data');
    }

    generateToken(res, user._id as string);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      phone: user.phone,
      profileImage: user.profileImage,
    } as IUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req: Request, res: Response) => {
  try {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req: any, res: Response) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      ...formatUserData(user),
    } as IUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

function formatUserData(user: IUser) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    createdAt: user.createdAt,
    facebookId: user.facebookId,
    googleId: user.googleId,
  } as IUser;
}

export { authUser, registerUser, logoutUser, getUserProfile };
