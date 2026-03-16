import { Request, Response } from "express";
import { documentQueue } from "../../infrastructure/queues/document.queue.js";

export async function retryFailedJobsController(req: Request, res: Response) {
  const jobs = await documentQueue.getFailed();

  for (const job of jobs) {
    await job.retry();
  }

  res.json({
    retried: jobs.length,
  });
}
