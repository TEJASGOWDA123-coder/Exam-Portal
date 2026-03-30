import { db } from "./lib/db";
import { academicSections } from "./lib/db/schema";

async function checkAndFixYearIdColumn() {
  try {
    // Try to query the academic_sections table to see its structure
    console.log("Checking academic_sections table structure...");

    // This will fail if year_id column doesn't exist or has wrong data
    const sections = await db.select().from(academicSections).limit(1);
    console.log("Table structure is correct");
    console.log("Sample section:", sections[0]);
  } catch (error: unknown) {
    console.error("Error accessing academic_sections:", error);

    // If the error is about year_id column, we need to drop it
    if (error instanceof Error && error.toString().includes("year_id")) {
      console.log(
        "year_id column issue detected. Attempting to drop column...",
      );

      try {
        // Try to drop the column
        await db.run("ALTER TABLE academic_sections DROP COLUMN year_id");
        console.log("Successfully dropped year_id column");
      } catch (dropError) {
        console.error("Failed to drop column:", dropError);

        // If we can't drop it, try to create a new table without the column
        console.log("Attempting to recreate table without year_id...");

        try {
          await db.run(`
            CREATE TABLE academic_sections_new (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              department_id TEXT NOT NULL,
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL,
              FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
            )
          `);

          await db.run(`
            INSERT INTO academic_sections_new (id, name, department_id, created_at, updated_at)
            SELECT id, name, department_id, created_at, updated_at FROM academic_sections
          `);

          await db.run("DROP TABLE academic_sections");
          await db.run(
            "ALTER TABLE academic_sections_new RENAME TO academic_sections",
          );

          console.log(
            "Successfully recreated academic_sections table without year_id",
          );
        } catch (recreateError) {
          console.error("Failed to recreate table:", recreateError);
        }
      }
    }
  }
}

checkAndFixYearIdColumn()
  .then(() => {
    console.log("Fix attempt completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
