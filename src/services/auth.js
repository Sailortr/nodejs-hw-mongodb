import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';
import createError from 'http-errors';
import { sendResetEmail } from './email.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ name, email, password: hashedPassword });

  return { id: newUser._id, name: newUser.name, email: newUser.email };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  await Session.deleteMany({ userId: user._id });
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

export const refreshTokenService = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (!session) throw createError(403, 'Invalid refresh token');

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    session.userId,
  );

  session.accessToken = accessToken;
  session.refreshToken = newRefreshToken;
  session.accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  session.refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );
  await session.save();

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken) => {
  await Session.deleteOne({ refreshToken });
};

export const sendPasswordResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(404, 'User not found!');

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  await sendResetEmail(email, token);
};

export const resetPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) throw createError(404, 'User not found!');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await Session.deleteMany({ userId: user._id });
  } catch (error) {
    throw createError(401, 'Token is expired or invalid.');
  }
};
