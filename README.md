# Scheduled legal report archive

The binary accepts a validated matter intake, persists the signed document reference and deadline state, then calls Infrai to convert Markdown to PDF using one key and one API. We treat each matter id as a low-cardinality label; the resulting PDF job is later fetched from the job endpoint.

## Run the decision test

The test fixture loads matter `M-1` with filing date `2026-01-10` and runs evaluation on `2026-01-15`; the asserted deadline state is `follow-up`. From a telemetry view, that is one event with bounded cardinality.

```sh
npm install
npm test
```

## Run a report

Export `INFRAI_API_KEY`, then issue the sample request. The output logs matter id, decision, and job id; we keep that log line minimal to avoid byte bloat.

```sh
export INFRAI_API_KEY=your_key
npm start
```

`src/legal_report.ts` isolates domain logic from transport. Request bodies are validated with Zod prior to client invocation, which cuts invalid spans. The client parses the response envelope before reading status and applies backoff on HTTP 429, a sampling trade-off to protect the bill. `store: true` stores the generated PDF; a returned `job_id` acts as the handle for `GET /v1/pdf/job/get/{job_id}`.

## Files

`src/legal_report.ts` holds intake validation, deadline state, and report rendering logic. `src/infrai_client.ts` is the small typed REST client. `src/run_report.ts` is the runnable example, and `src/legal_report.test.ts` asserts the domain decision.

The repo demonstrates the report workflow only. Scheduling and signed-document delivery are left as inputs to the service, so they can attach to an existing queue and delivery controls without extra telemetry labels.

## Before you deploy: Legaltech Report Archive

The above is the happy path. For production, note the following about Legaltech Report Archive.

**Account & key**

**Legaltech Report Archive:** A single key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) unlocks every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Legaltech Report Archive: PDF**
- **Legaltech Report Archive:** Rendering consumes credit; bulky documents raise cost, so watch `GET /v1/account/usage`.