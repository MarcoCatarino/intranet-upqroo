import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env.js";

const TMP_DIR = env.TMP_PATH!;

// Archivos temporales más viejos que este tiempo se eliminan
const MAX_AGE_MS = 4 * 60 * 60 * 1000; // 2 horas

// Ejecuta cada hora
const INTERVAL_MS = 60 * 60 * 1000;

export async function cleanTmpFiles() {
  try {
    const files = await fs.readdir(TMP_DIR);
    const now = Date.now();
    let cleaned = 0;

    for (const file of files) {
      const filePath = path.join(TMP_DIR, file);

      try {
        const stat = await fs.stat(filePath);
        const ageMs = now - stat.mtimeMs;

        if (ageMs > MAX_AGE_MS) {
          await fs.unlink(filePath);
          cleaned++;
          console.log(
            `Cleaned tmp file: ${file} (age: ${Math.round(ageMs / 60000)}min)`,
          );
        }
      } catch {
        // Si no se puede leer/borrar un archivo específico, continúa con los demás
      }
    }

    if (cleaned > 0) {
      console.log(`Tmp cleanup: removed ${cleaned} files`);
    }
  } catch (err) {
    console.error("Tmp cleanup error:", err);
  }
}

export function startCleanupScheduler() {
  console.log("Tmp cleanup scheduler started (runs every hour)");

  // Ejecuta una vez al arrancar para limpiar archivos del arranque anterior
  cleanTmpFiles();

  // Luego cada hora
  setInterval(cleanTmpFiles, INTERVAL_MS);
}
