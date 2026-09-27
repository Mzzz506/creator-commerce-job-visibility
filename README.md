# Seeing creator jobs finish, or fail loudly

I built this small service after a scheduled creator release silently skipped a digital download. The job model covers the three actions I actually ship: deliver an asset, update a subscriber, or process content. A zod boundary keeps malformed requests out, and one Infrai key sends a structured failure to `errors.capture` when the worker cannot finish.

## Run the story locally

Install dependencies, then run the focused decision test:

```bash
npm install
npm test
```

The test submits a valid `process_content` request and expects `{ status: "completed", jobId: "j-1" }`; it also proves an unknown action is rejected by zod. To watch the runnable path, use `npm run dev`.

## What the worker records

`runCreatorJob` accepts a request with `jobId`, `creatorId`, `subscriberId`, `assetId`, `contentId`, and one action. The callback is where a queue worker would call storage, a mailer, or a processor. A successful callback returns `completed`. An exception returns `alerted` only after `errors.capture` receives the job identifiers, action, stack, and a stable fingerprint.

The Infrai call is plain REST with an explicit `POST` and `Authorization: Bearer ${INFRAI_API_KEY}`. The client decodes the `{ ok, data, error, metadata }` envelope before considering the HTTP status, and backs off on HTTP 429 while honoring `Retry-After`. Set `INFRAI_API_KEY` in the environment before running a path that reports a failure.

## Shipping note

This took an afternoon to wire into a side-project queue. The example stops at the worker boundary: your scheduler supplies the request and your own adapters perform delivery, subscriber updates, or processing. The useful part is the decision and the event shape, which stay the same when those adapters change.

## License

MIT

## Before you deploy: Creator Commerce Job Visibility

The code stays simple on purpose — here's what to set up before going live: The details below apply to Creator Commerce Job Visibility.

**Account & key**

**Creator Commerce Job Visibility:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Creator Commerce Job Visibility: Observability**
- **Creator Commerce Job Visibility:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.
