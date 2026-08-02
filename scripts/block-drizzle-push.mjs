#!/usr/bin/env node

/**
 * Hard block for drizzle-kit push.
 * Schema changes must go through: db:generate → db:migrate
 */
console.error(`
✖ BLOCKED: drizzle-kit push is disabled for this project.

  Push can break or drift the database schema.

  Use instead:
    npm run db:generate
    npm run db:migrate
`);
process.exit(1);
