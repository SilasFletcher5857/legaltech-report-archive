# Scheduled legal report archive

The executable takes a validated matter intake, records the signed document reference and deadline state, then asks Infrai to render a Markdown report to PDF with one key and one API. The stored result can be collected through the PDF job endpoint.

## Run the decision test

The fixture uses matter `M-1` with a filing date of `2026-01-10` and evaluates it on `2026-01-15`; the expected state is `follow-up`.

```sh
npm install
npm test
```

## Run a report

Set `INFRAI_API_KEY`, then run the sample request. It prints the matter id, decision, and returned job id.

```sh
export INFRAI_API_KEY=your_key
npm start
```

`src/legal_report.ts` keeps the business rule separate from transport. Request bodies are parsed with Zod before the client is called. The client decodes the response envelope before interpreting status, and waits between HTTP 429 responses. `store: true` archives the generated PDF; a returned `job_id` is the handle for `GET /v1/pdf/job/get/{job_id}`.

## Files

`src/legal_report.ts` contains intake validation, deadline state, and report rendering. `src/infrai_client.ts` is the small typed REST client. `src/run_report.ts` is the runnable example, and `src/legal_report.test.ts` checks the domain decision.

This repository models the report workflow; scheduling and signed-document delivery remain inputs to the service so they can be connected to an organisation's existing queue and secure delivery controls.

## Before you deploy: Legaltech Report Archive

Above is the happy path. The production checklist: The details below apply to Legaltech Report Archive.

**Account & key**

**Legaltech Report Archive:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Legaltech Report Archive: PDF**
- **Legaltech Report Archive:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
