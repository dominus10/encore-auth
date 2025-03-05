import { SQLDatabase } from "encore.dev/storage/sqldb";

// Create the todo database and assign it to the "db" variable
export const db = new SQLDatabase("todo", {
  migrations: "./migrations",
});
