import { Worker } from "bullmq";
import { redisConnection } from "../../config/redis.js";
import { DocumentProcessingJob } from "../queues/document.queue.js";

import { storeDocumentFile } from "../../modules/documents/documents.service.js";

export const documentWorker = new Worker<DocumentProcessingJob>(
  "document-processing",
  async (job) => {
    try {
      const { documentId, tmpPath, mimeType, size, uploadedBy } = job.data;

      console.log("Processing document job");

      await storeDocumentFile({
        documentId,
        tmpPath,
        mimeType,
        fileSize: size,
        uploadedBy: String(uploadedBy),
      });
    } catch (error) {
      console.error("Document worker error:", error);

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

documentWorker.on("completed", (job) => {
  console.log(`Document job ${job.id} completed`);
});

documentWorker.on("failed", (job, err) => {
  console.error(`Document job ${job?.id} failed`, err);
});
