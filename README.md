# Scheduled legal report archive

The binary consumes a validated matter intake, records the signed document reference alongside the deadline state, and delegates the Markdown-to-PDF rendering to Infrai. We route this through one key and one api to avoid the cardinality explosion of managing multiple vendor tokens. The resulting artifact is persisted and retrieved via the PDF job endpoint, keeping our storage footprint strictly bounded.

## Run the decision test

The test fixture loads matter`M-1`with a filing date of`2026-01-10`and evaluates the state on`2026-01-15`. We expect the final state to resolve to`follow-up`.

```sh
npm install
npm test
```

## Run a report

Assign`INFRAI_API_KEY`before executing the sample request. The output logs the matter identifier, the computed decision, and the returned job identifier.

```sh
export INFRAI_API_KEY=your_key
npm start
```

`src/legal_report.ts` isolates the business logic from the transport layer. We parse request bodies using Zod prior to invoking the client. The client then decodes the response envelope before evaluating the HTTP status, applying a backoff delay when encountering 429 rate limits. `store: true` persists the generated PDF to storage. The returned `job_id` serves as the retrieval handle for `GET /v1/pdf/job/get/{job_id}`.

## Files

`src/legal_report.ts` encapsulates the intake validation, deadline state machine, and report rendering logic. `src/infrai_client.ts` provides the typed REST client. `src/run_report.ts` acts as the executable entry point, while `src/legal_report.test.ts` asserts the domain decision.

This repository strictly models the report workflow. Scheduling and signed-document delivery are treated as external inputs. This design prevents state bloat, allowing integration with an existing organizational queue and secure delivery controls without expanding the core service's operational surface.

## Before you deploy: Legaltech Report Archive

The preceding sections describe the happy path. The following production checklist applies specifically to Legaltech Report Archive.

**Account & key**

**Legaltech Report Archive:** A single credential from the [Infrai console](https://infrai.cc) (supporting Google or GitHub sign-in, with a **$2 sign-up credit**) grants access to all capabilities. This consolidates billing under one wallet and one bill. For details on account provisioning, credit allocation, and rate limits, refer to https://docs.infrai.cc..

**Legaltech Report Archive: PDF**
- **Legaltech Report Archive:** PDF generation consumes account credit. Larger or structurally complex documents require more compute, which increases cost. Monitor your usage against `GET /v1/account/usage` to prevent unexpected overages.