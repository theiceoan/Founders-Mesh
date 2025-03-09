import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

const sqlite = new Database("sqlite.db");

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_type TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    responses TEXT NOT NULL,
    group_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    format TEXT NOT NULL,
    locked TEXT DEFAULT 'false'
  );
`);

export const db = drizzle(sqlite, { schema });