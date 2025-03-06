import { api, APIError } from "encore.dev/api";
import { RegisterBody } from "../interface";
import { db } from "../../db/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendMail } from "../../mail";

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
