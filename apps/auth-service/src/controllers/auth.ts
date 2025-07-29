import { Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import {
  addRefreshToken,
  createUser,
  getRefrehTokenByFilter,
  getUserByFilter,
  updateRefreshToken,
} from '../services/auth';
import { SelectUser } from '../db/schema';
import jwt, { SignOptions } from 'jsonwebtoken';
import { ApiError } from 'shared';

class AuthController {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const salt = await bcryptjs.genSalt(12);
      const hashedPassword = await bcryptjs.hash(req.body.password, salt);

      const userPayload = { ...req.body, password: hashedPassword };

      const data = await createUser(userPayload);

      if (data) {
        res
          .status(201)
          .json({ message: 'User is created successfully!', data: data });
      }
      res.status(400).json({ message: 'Bad request!' });
    } catch (error) {
      next(error);
    }
  }

  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const [user]: Array<SelectUser> = await getUserByFilter({ email });

      if (!user) {
        throw new ApiError(404, 'User not found!');
      }

      if (!(await bcryptjs.compare(password, user.password))) {
        throw new ApiError(401, 'Invalid credentials!');
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        {
          expiresIn:
            (process.env?.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']) ||
            '15m',
        },
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        {
          expiresIn:
            (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) ||
            '7d',
        },
      );

      await addRefreshToken({
        token: refreshToken,
        userId: user.id,
        userAgent: req.headers['user-agent'] as string,
        ipAddress: req.ip,
      });
      res.status(200).json({
        message: 'User signed in successfully!',
        accessToken,
        refreshToken,
      });
      return;
    } catch (error) {
      next(error);
    }
  }

  async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required!' });
        return;
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { userId: number };

      const userId = decoded.userId;

      if (!userId) {
        throw new ApiError(403, 'Invalid refresh token!');
      }

      const [storedToken] = await getRefrehTokenByFilter({
        token: refreshToken,
        userId,
      });

      if (!storedToken) {
        throw new ApiError(403, 'Refresh token not found!');
      }

      const [user] = await getUserByFilter({ id: userId });

      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        {
          expiresIn:
            (process.env?.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']) ||
            '15m',
        },
      );

      res.status(200).json({
        message: 'Access token refreshed successfully!',
        accessToken: newAccessToken,
      });

      return;
    } catch (error) {
      next(error);
    }
  }

  async signOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required!');
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { userId: number };

      const userId = decoded.userId;

      if (!userId) {
        throw new ApiError(403, 'Invalid refresh token!');
      }

      const [storedToken] = await getRefrehTokenByFilter({
        token: refreshToken,
        userId,
      });

      if (!storedToken) {
        throw new ApiError(403, 'Refresh token not found!');
      }

      if (storedToken.isRevoked) {
        throw new ApiError(403, 'Refresh token is already revoked!');
      }

      await updateRefreshToken(storedToken.id, { isRevoked: 1 });

      res.status(200).json({ message: 'User signed out successfully!' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
