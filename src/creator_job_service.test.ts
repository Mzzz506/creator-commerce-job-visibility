import assert from "node:assert/strict";
import { runCreatorJob } from "./creator_job_service.js";

const completed = await runCreatorJob({ jobId: "j-1", creatorId: "c-1", subscriberId: "s-1", assetId: "a-1", contentId: "p-1", action: "process_content" }, async () => {});
assert.deepEqual(completed, { status: "completed", jobId: "j-1" });
await assert.rejects(runCreatorJob({ jobId: "j-2", creatorId: "c-1", subscriberId: "s-1", assetId: "a-1", contentId: "p-1", action: "unknown" }, async () => {}));
console.log("job decision test passed");
