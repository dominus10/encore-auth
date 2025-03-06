import { APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthParams } from "../interface";
import { roles } from "../util/roles";

interface AuthData {
  userID: string;
}

interface CJWTPayload extends JwtPayload {
  userID?: string;
  roles?: string[];
}

const auth = authHandler(async (params: AuthParams): Promise<AuthData> => {
  try {
    if (!params.authorization) {
      throw APIError.unauthenticated("No token provided");
    }

    // Extract token from "Bearer <token>"
    const token = params.authorization.replace("Bearer ", "");

    // Verify JWT
    const res = jwt.verify(token, process.env.JWT_SECRET!) as CJWTPayload;

    // Ensure the token has not expired
    if (!res.exp || res.exp * 1000 < Date.now()) {
      throw APIError.unauthenticated("Token expired");
    }

    // Ensure userID exists in token payload
    if (!res.userID) {
      throw APIError.unauthenticated("Invalid token payload");
    }

    return { userID: res.userID };
  } catch (error) {
    throw APIError.unauthenticated("Invalid or expired token");
  }
});

export const gateway = new Gateway({ authHandler: auth });
