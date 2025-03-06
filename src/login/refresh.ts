import { api, APIError, Header } from "encore.dev/api";
import jwt from "jsonwebtoken";
import { BaseAuthParams, LoginResponse } from "../interface";

const ACCESS_TOKEN_EXPIRY = "1d"; // Access token valid for 1 day
const REFRESH_TOKEN_EXPIRY = "7d"; // Refresh token valid for 7 days

// Simulated in-memory storage for refresh tokens (Replace with Redis/DB in production)
const refreshTokens = new Set<string>();

export const refreshToken = api(
  {
    auth: true,
    method: "POST",
    path: "/auth/refresh",
    expose: true,
  },
  async (params: BaseAuthParams): Promise<LoginResponse> => {
    try {
      const refreshToken =
        params.refreshToken?.match(/refreshToken=([^;]+)/)?.[1];

      if (!refreshToken)
        throw APIError.unauthenticated("No refresh token provided");

      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
        email: string;
        userid: string;
      };

      if (!decoded.userid)
        throw APIError.unauthenticated("Invalid refresh token");

      // Ensure the refresh token is valid (Check against store)
      if (!refreshTokens.has(refreshToken))
        throw APIError.unauthenticated("Refresh token expired");

      // Generate a new access token
      const newAccessToken = jwt.sign(
        { email: decoded.email, userID: decoded.userid },
        process.env.JWT_SECRET!,
        {
          expiresIn: ACCESS_TOKEN_EXPIRY,
        }
      );

      // Generate a new refresh token (Token rotation)
      const newRefreshToken = jwt.sign(
        { email: decoded.email, userID: decoded.userid },
        process.env.JWT_SECRET!,
        {
          expiresIn: REFRESH_TOKEN_EXPIRY,
        }
      );

      // Remove old refresh token and store the new one
      refreshTokens.delete(refreshToken);
      refreshTokens.add(newRefreshToken);

      return {
        message: "Token refreshed",
        refreshToken: `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Secure; SameSite=Strict`,
        csrfToken: `csrfToken=${newRefreshToken}; HttpOnly; Path=/; Secure; SameSite=Strict`,
        xcsrfToken: newRefreshToken,
        authorization: `Bearer ${newAccessToken}`,
      };
    } catch (error) {
      throw APIError.unauthenticated("Invalid or expired refresh token");
    }
  }
);
