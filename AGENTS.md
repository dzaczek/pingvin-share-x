# Notes for coding agents

For autonomous agents proposing changes to this repository: Jules, Copilot,
Claude Code and anything similar. Humans using AI to write a patch should read
[AI_USAGE_POLICY.md](AI_USAGE_POLICY.md) instead, which is about a different
thing.

This is written from what agent suggestions have actually got right and wrong
here, not from a general idea of good practice.

## What this project is

A self hosted file sharing app. TypeScript throughout: NestJS in `backend`,
Next.js on the pages router in `frontend`. **There is no Go, Python or Rust
here.** Suggestions have arrived for `rbac/rbac.go` and `handler/dashboard.go`,
which belong to some other repository.

SQLite through Prisma 7 with a driver adapter. Prisma 6 stored `DateTime` as
integers and 7 writes ISO text; a migration converts the old rows and the
difference has already cost this project real data, so treat anything touching
dates as load bearing.

## Before proposing anything

**Check it is not already done.** The same TODO has been sent twice, once after
it was fixed and the TODO deleted. Three of eight functions reported as
untested had tests, in the other half of the repository.

**Check where the tests are.** Backend tests sit beside the code as
`*.spec.ts`, plus `backend/test/prisma/*.db.spec.ts` for anything needing a
real database. Frontend tests are `*.test.ts` beside the code, except tests for
pages, which live in `frontend/src/test/pages` because anything under
`src/pages` is a route and `next build` fails trying to render a test file as
one.

## Commands

```
cd backend  && npm test          # unit
cd backend  && npm run test:db   # builds a sqlite file from the real migrations
cd frontend && npm test
cd backend  && npx tsc --noEmit
cd frontend && npm run build
scripts/build.sh <version>       # image, stamped with the commit
```

`scripts/diagnose-prod.sh` reports the state of a running instance, read only.

## What makes a suggestion useful here

**Say what the value does, not what the line looks like.** The strongest
suggestions received named a line and were right about it, and the thing worth
fixing was a few lines further on: a query inside a loop under a `readdirSync`,
unawaited writes under a `writeFileSync`, a config value that reached a cron job
unchecked. Following the value downstream is where the value is.

**Do not call a change a performance improvement without measuring it.** Two
suggestions proposed replacing synchronous file I/O with the promise version as
a speed up. Measured at the sizes this app actually handles, the async call is
slower per operation and the event loop lag is unchanged; they only separate at
file sizes and directory counts this app does not reach. The changes were still
worth making, for a reason the suggestion did not give. If a measurement is
impractical, say so rather than asserting a benefit.

**Ease of testing is not value of testing.** "Extremely easy to test" was the
stated reason for several suggestions, and it selects for functions with no
logic, which is to say functions with nothing to get wrong. A test that
restates a struct-to-struct mapping fails when a field is added and never
catches a bug. Prefer branches, fallbacks and anything that decides something.

**A test that passes before the change is worth more than one written after.**
Every real bug found here was found by writing the test first and watching it
fail. Four times the test contradicted what the author expected and the code
turned out to be right.

## House rules

Every change needs a test that fails without it. Say so in the pull request,
and say how you checked the test is not vacuous.

Do not weaken a check, a type or a lint rule to make CI green. If a new rule
fires on old code, say how many places and leave them visible rather than
switching the rule off.

Suppressing a lint or scanning rule needs the reason written above it in the
code. There are examples: `@next/next/no-location-assign-relative-destination`
is suppressed where the browser is handed a file stream rather than a page.

`SECURITY-TRIAGE.md` records which scanning alerts were dismissed and why.
Check it before reporting one, and add to it rather than re-deriving the
argument. A dismissal is pinned to a line, so editing nearby code raises it
again; that is expected.

Do not commit secrets, do not push to `main`, and do not rewrite published
history.
