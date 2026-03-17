import mysql from "mysql2/promise";
import dotenv from "dotenv";

import { env } from "../../config/env.js";

dotenv.config();

export const pool = mysql.createPool({
  host: env.DB.HOST,
  port: env.DB.PORT,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  database: env.DB.NAME,

  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 200,
  connectTimeout: 10000,
});
