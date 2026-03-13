import { drizzle } from "drizzle-orm/mysql2";
import { pool } from "./connection.js";

export const db = drizzle(pool);
