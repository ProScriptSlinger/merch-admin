// Archivo simplificado para evitar errores de conexión en el deploy
// En una aplicación real, aquí estaría la configuración de la base de datos

export const db = {
  // Placeholder para futuras implementaciones de base de datos
  query: async (sql: string) => {
    console.log("Database query:", sql)
    return []
  },
}

export async function testDbConnection() {
  console.log("Database connection test - using mock data")
  return { success: true, message: "Using mock data" }
}
