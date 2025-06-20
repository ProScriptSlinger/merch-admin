import { neon } from "@neondatabase/serverless"

if (!process.env.POSTGRES_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.POSTGRES_URL)
// export const db = drizzle(sql); // If using Drizzle ORM
export const db = sql // Using raw SQL for this example for simplicity with @neondatabase/serverless

// Example function to test connection, not strictly needed for app
export async function testDbConnection() {
  try {
    const result = await db`SELECT NOW()`
    console.log("Database connection successful:", result)
    return result
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}
