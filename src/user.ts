import { api, APIError, Header } from "encore.dev/api";
import { db } from "../db/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { sendMail } from "../mail";

interface Body {
  email?: string;
  password: string;
}

export const loginUser = api(
  { method: "POST", path: "/login", expose: true },
  async ({ email, password }: Body): Promise<Response> => {
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

interface Response {
  message: string;
  refreshToken: Header<"Set-Cookie">;
  csrfToken: Header<"Set-Cookie">;
  xcsrfToken: Header<"X-CSRF-Token">;
  authorization: Header<"Authorization">;
}

interface RegisterBody extends Body {
  email: string;
}

export const registerUser = api(
  { method: "POST", path: "/register", expose: true },
  async ({ email, password }: RegisterBody): Promise<RegisterResponse> => {
    if (!email.includes("@"))
      throw APIError.invalidArgument("Invalid email format.");

    // Check if the user already exists
    const existingUser =
      await db.queryRow`SELECT userid FROM users WHERE email = ${email}`;
    if (existingUser)
      throw APIError.permissionDenied("Email already registered.");

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    const confirmationToken = randomBytes(32).toString("hex");
    // Insert user into database
    const newUser = await db.queryRow`
      INSERT INTO users (email, password,confirmation_token) 
      VALUES (${email}, ${hashedPassword},${confirmationToken}) 
      RETURNING userid, email
    `;

    if (!newUser) throw APIError.internal("Failed to create user.");

    await sendMail(email, confirmationToken);

    return {
      message:
        "Registration complete! Please check your email to confirm your account.",
    };
  }
);

interface RegisterResponse {
  message: string;
}

export const logoutUser = api(
  { method: "POST", path: "/logout", expose: true },
  async (): Promise<LogoutResponse> => {
    return {
      message: "Logout successful!",
      refreshToken: `refresh_token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict`,
      csrfToken: `csrf_token=; Secure; Path=/; Max-Age=0; SameSite=Strict`,
    };
  }
);

type LogoutResponse = Omit<Response, "xcsrfToken" | "authorization">;
