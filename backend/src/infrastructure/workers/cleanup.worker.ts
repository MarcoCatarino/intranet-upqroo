import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env.js";

const TMP_DIR = env.TMP_PATH!;

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const INTERVAL_MS = 60 * 60 * 1000;

export async function cleanTmpFiles() {
  try {
    const files = await fs.readdir(TMP_DIR);
    const now = Date.now();
    let cleaned = 0;

    for (const file of files) {
      if (!file.startsWith("tmp-")) continue;

      const filePath = path.join(TMP_DIR, file);

      try {
        const stat = await fs.stat(filePath);
        const ageMs = now - stat.mtimeMs;

        if (ageMs > MAX_AGE_MS) {
          await fs.unlink(filePath);
          cleaned++;
          console.log(
            `Cleaned tmp file: ${file} (age: ${Math.round(ageMs / 3600000)}h)`,
          );
        }
      } catch {
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
  console.log("Tmp cleanup scheduler started (runs every hour, max age 24h)");

  cleanTmpFiles();

  setInterval(cleanTmpFiles, INTERVAL_MS);
}
