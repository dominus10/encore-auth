import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { api, APIError } from "encore.dev/api";
import jwt from "jsonwebtoken";
import { db } from "../../db/db";
import { LoginBody, LoginResponse } from "../interface";

export const loginUser = api(
  { method: "POST", path: "/login", expose: true },
  async ({ email, password }: LoginBody): Promise<LoginResponse> => {
    if (!email) throw APIError.permissionDenied("Invalid email or password.");

    const user =
      await db.queryRow`SELECT userid, email, password FROM users WHERE email=${email}`;
    if (!user) throw APIError.permissionDenied("Invalid email or password.");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      throw APIError.permissionDenied("Invalid email or password.");

    const accessToken = jwt.sign(
      {
        email: user.email,
        userid: user.userid,
      },
      "test-value",
      {
        expiresIn: "1d",
      }
    );

    const refreshToken = jwt.sign({ userid: user.userid }, "test-value", {
      expiresIn: "7d",
    });

    const csrfToken = randomBytes(32).toString("hex");

    return {
      message: "Login successful!",
      refreshToken: `refresh_token=${refreshToken}; HttpOnly; Secure; Path=/; Max-Age=604800; SameSite=Strict`,
      csrfToken: `csrf_token=${csrfToken}; Secure; Path=/; Max-Age=86400; SameSite=Strict`,
      xcsrfToken: `xcsrfToken=${csrfToken}`,
      authorization: `Bearer ${accessToken}`,
    };
  }
);
