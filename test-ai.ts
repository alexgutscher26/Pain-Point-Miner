import { extractPainPoints } from "./lib/ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testAI() {
  const dummyPost = {
    title: "How to find SaaS pain points on Reddit?",
    selftext:
      "I am struggling to find ideas for my next SaaS. I've spent hours scrolling but nothing seems like a real problem. Is there a tool that can help?",
    url: "https://reddit.com/r/SaaS/dummy",
    author: "dummy_user",
    subreddit: "SaaS",
    comments: [
      {
        body: "Search for 'frustrating' or 'I hate it when' and you will find plenty!",
      },
      { body: "Manual work is the best indicator of pain." },
    ],
  };

  console.log("Testing AI extraction with dummy post...");
  try {
    const results = await extractPainPoints(dummyPost, [
      "SaaS ideas",
      "struggling",
    ]);
    console.log("RESULTS FOUND:", results.length);
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("AI TEST FAILED:", error);
  }
}

testAI();
