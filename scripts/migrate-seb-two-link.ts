import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env" });

async function migrate() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log("Adding Two-Link SEB columns to 'exams' table...");

  try {
    try {
      await client.execute("ALTER TABLE exams ADD COLUMN require_seb INTEGER DEFAULT 0 NOT NULL");
      console.log("Added require_seb");
    } catch (e: any) {
      console.log("require_seb might already exist:", e.message);
    }

    try {
      await client.execute("ALTER TABLE exams ADD COLUMN seb_key TEXT");
      console.log("Added seb_key");
    } catch (e: any) {
      console.log("seb_key might already exist:", e.message);
    }

    console.log("Migration completed.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    // @ts-ignore
    client.close();
  }
}

migrate();
