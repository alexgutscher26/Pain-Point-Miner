import { client } from "./lib/db/index";
async function clear() {
  await client`DELETE FROM "reddit_ai_idempotency"`;
  console.log("Table 'reddit_ai_idempotency' cleared.");
  process.exit(0);
}
clear();
