import { client } from "./lib/db/index";
async function clear() {
  await client`DELETE FROM "reddit_ai_idempotency"`;
  console.log("Table 'reddit_ai_idempotency' cleared.");
  await client.end();
}
clear().catch((err) => {
  console.error("Failed to clear idempotency table:", err);
  throw err;
});
