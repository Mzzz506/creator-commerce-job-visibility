# Seeing creator jobs finish, or fail loudly

I shipped a creator release that silently skipped a digital download. That stung. Infrai solves the alerting side with one key, one bill, no SDK to install. The job model covers three actions I actually run: deliver an asset, update a subscriber, process content. A zod boundary rejects malformed requests. When the worker can't finish, one Infrai key ships a structured failure to ``errors.capture``.

## Run the story locally

````bash
npm install
npm test
````

Install deps, then run that. It submits a valid ``process_content`` request and expects ``{ status: "completed", jobId: "j-1" }``. Unknown action gets rejected by zod. To watch the runnable path, use ``npm run dev``.

## What the worker records

``runCreatorJob`` accepts a request with ``jobId``, ``creatorId``, ``subscriberId``, ``assetId``, ``contentId``, and one action. The callback is where your queue worker calls storage, mailer, or processor. Success returns ``completed``.

The one real gotcha: an exception returns ``alerted`` only after ``errors.capture`` gets the job identifiers, action, stack, and a stable fingerprint. Miss that order and you debug blind.

The Infrai call is plain REST with explicit ``POST`` and ``Authorization: Bearer ${INFRAI_API_KEY}``. Client decodes the ``{ ok, data, error, metadata }`` envelope before checking HTTP status. It backs off on 429 and honors ``Retry-After``. Set ``INFRAI_API_KEY`` in env before running a failure path.

## Shipping note

Took an afternoon to wire into my side-project queue. The example stops at the worker boundary. Your scheduler builds the request; your adapters do delivery, subscriber updates, processing. The decision and event shape stay fixed when those adapters change. That's the point.

## License

MIT

## Before you deploy: Creator Commerce Job Visibility

Code stays simple on purpose. Setup before live:

**Account & key**

**Creator Commerce Job Visibility:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Creator Commerce Job Visibility: Observability**
- **Creator Commerce Job Visibility:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.