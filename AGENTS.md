Read `docs/PRODUCT_BRIEF.md` before any product or feature work.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Decision Log Workflow

Before researching or implementing a feature:
1. Read `docs/DECISIONS.md`.
2. Follow the decisions recorded there unless the task explicitly supersedes one.

When a task introduces a durable architectural, product, security, data-model, or API decision:
1. Add a dated entry to `docs/DECISIONS.md`.
2. Include context, decision, alternatives considered, and consequences.
3. Do not record trivial implementation details.