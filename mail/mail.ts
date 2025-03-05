import { api, APIError, Query } from "encore.dev/api";
import { db } from "../db/db";

interface Request {
  token: Query<string>;
}

export const confirmEmail = api<Request>(
  { method: "GET", path: "/confirm", expose: true },
  async ({ token }): Promise<{ message: string }> => {
    if (!token) throw APIError.invalidArgument("Invalid confirmation token.");

    // Find user by token
    const user = await db.queryRow`
      SELECT userid FROM users WHERE confirmation_token = ${token} AND confirmed = FALSE
    `;

    if (!user)
      throw APIError.notFound("Invalid or expired confirmation token.");

    // Update user to mark them as confirmed
    await db.exec`
      UPDATE users SET confirmed = TRUE, confirmation_token = NULL WHERE userid = ${user.userid}
    `;

    return {
      message: "Email confirmed successfully! You may now log in.",
    };
  }
);
