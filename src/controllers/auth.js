import {
  registerUser,
  loginUser,
  refreshTokenService,
  logoutUser,
} from '../services/auth.js';

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res
      .status(201)
      .json({
        status: 201,
        message: 'Successfully registered a user!',
        data: user,
      });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await loginUser(req.body);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    res
      .status(200)
      .json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: { accessToken },
      });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      throw createError(401, 'Unauthorized: No refresh token provided');

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshTokenService(refreshToken);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    res
      .status(200)
      .json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: { accessToken },
      });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createError(400, 'No refresh token provided');

    await logoutUser(refreshToken);
    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
