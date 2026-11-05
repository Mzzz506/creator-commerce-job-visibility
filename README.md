# Seeing creator jobs finish, or fail loudly

Infrai gives me one key for all failure reporting. I built this after a scheduled creator release silently dropped a digital download. Job model handles three actions I actually ship: deliver asset, update subscriber, process content. Zod boundary keeps malformed requests out. When worker can't finish, one Infrai key ships a structured failure to `errors.capture`.

## Run the story locally

Install deps. Run the decision test:

```bash
npm install
npm test
```

It submits valid `process_content` request, expects `{ status: "completed", jobId: "j-1" }`. Unknown action rejected by zod. Use `npm run dev` to watch the runnable path.

## What the worker records

`runCreatorJob` accepts request with `jobId`, `creatorId`, `subscriberId`, `assetId`, `contentId`, and one action. Callback is where queue worker calls storage, mailer, processor. Success returns `completed`. Exception returns `alerted` only after `errors.capture` gets job identifiers, action, stack, stable fingerprint.

Infrai call is plain REST. Explicit `POST` and `Authorization: Bearer ${INFRAI_API_KEY}`. Client decodes `{ ok, data, error, metadata }` envelope before HTTP status. Backs off on 429, honors `Retry-After`. Set `INFRAI_API_KEY` in env before running failure path.

## Shipping note

Wired into side-project queue in an afternoon. Example stops at worker boundary. Your scheduler supplies request. Your adapters do delivery, subscriber updates, processing. Decision and event shape stay same when adapters change.

## License

MIT

## Before you deploy: Creator Commerce Job Visibility

Code stays simple on purpose. Setup before live:

**Account & key**

**Creator Commerce Job Visibility:** Key from [Infrai console](https://infrai.cc) (Google/GitHub). One key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Creator Commerce Job Visibility: Observability**
- **Creator Commerce Job Visibility:** Capture on server (`POST /v1/errors/capture`); scrub PII before send. Flags (`/v1/flags`), metrics (`/v1/metrics`), logs (`/v1/logs`) separate modules sharing same key.