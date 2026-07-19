import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve data dir relative to this file (lib/db/src → workspace root = ../../../data)
const _dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(_dirname, "../../../data");
fs.mkdirSync(dbDir, { recursive: true });

const dbPath = process.env["DB_PATH"] ?? path.join(dbDir, "sabaik.db");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export * from "./schema";
