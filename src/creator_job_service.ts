import { z } from "zod";
import { captureFailure } from "./infrai_client.js";

export const JobRequest = z.object({
  jobId: z.string().min(1), creatorId: z.string().min(1), subscriberId: z.string().min(1),
  assetId: z.string().min(1), contentId: z.string().min(1), action: z.enum(["deliver_asset", "notify_subscriber", "process_content"])
});
export type JobRequest = z.infer<typeof JobRequest>;

export function shouldAlert(error: unknown): boolean { return error instanceof Error && error.message.length > 0; }

export async function runCreatorJob(input: unknown, execute: (job: JobRequest) => Promise<void>): Promise<{ status: "completed" | "alerted"; jobId?: string }> {
  const job = JobRequest.parse(input);
  try { await execute(job); return { status: "completed", jobId: job.jobId }; }
  catch (error) {
    if (shouldAlert(error)) {
      await captureFailure({ title: `Creator job ${job.jobId} failed`, message: String(error), level: "error", fingerprint: ["creator-commerce", job.action], exception: error instanceof Error ? error.stack : String(error), context: { jobId: job.jobId, creatorId: job.creatorId, subscriberId: job.subscriberId, assetId: job.assetId, contentId: job.contentId, action: job.action } });
      return { status: "alerted", jobId: job.jobId };
    }
    throw error;
  }
}

const demo: JobRequest = { jobId: "daily-asset-001", creatorId: "creator-7", subscriberId: "subscriber-42", assetId: "pack-august", contentId: "post-18", action: "deliver_asset" };
if (import.meta.url === `file://${process.argv[1]}`) {
  runCreatorJob(demo, async job => { console.log(`completed ${job.action} for ${job.jobId}`); }).then(result => console.log(result));
}
