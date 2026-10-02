import { LoopsClient } from "loops";

if (!process.env.LOOPS_API_KEY) {
  console.warn("LOOPS_API_KEY is missing. Loops integration will be disabled.");
}

export const loops = new LoopsClient(
  process.env.LOOPS_API_KEY || "dummy_loops_key",
);
