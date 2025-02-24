import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../db/User.js';
import Session from '../db/Session.js';
import createError from 'http-errors';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw createError(401, 'Invalid email or password');
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    await Session.deleteMany({ userId: user._id });
    await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

//

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createError(401, 'Unauthorized');

    const session = await Session.findOne({ refreshToken });
    if (!session) throw createError(403, 'Invalid refresh token');

    const newAccessToken = jwt.sign(
      { id: session.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    session.accessToken = newAccessToken;
    session.accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
    await session.save();

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed session!',
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
};

//

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204);

    await Session.deleteOne({ refreshToken });

    res.clearCookie('refreshToken');
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
