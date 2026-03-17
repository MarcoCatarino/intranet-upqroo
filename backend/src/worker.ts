import "./config/env.js";
import "./infrastructure/workers/document.worker.js";
import { startCleanupScheduler } from "./infrastructure/workers/cleanup.worker.js";

startCleanupScheduler();

console.log("Document worker started");
