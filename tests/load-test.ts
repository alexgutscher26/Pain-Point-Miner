import { spawn } from "child_process";

const TARGET_URL = "http://localhost:3000";
const CONCURRENT_RUNS = 50;
const USER_ID = "JaeTz21ZZWwhf1Cdi1T47ROxWzqqxmbG"; // Verified user ID
const KEYWORDS = Array.from({ length: CONCURRENT_RUNS }, (_, i) => `loadtest-${i}-${Date.now()}`);

async function runSimulation() {
  console.log(`🚀 Starting Load Test: ${CONCURRENT_RUNS} concurrent mining runs...`);
  console.log(`🎯 Target: ${TARGET_URL}`);
  console.log(`👤 User ID: ${USER_ID}`);

  const startTime = Date.now();
  const results = {
    total: CONCURRENT_RUNS,
    success: 0,
    failed: 0,
    latency: [] as number[],
    streamStability: [] as boolean[],
  };

  const tasks = KEYWORDS.map(async (keyword, idx) => {
    const start = Date.now();
    try {
      // 1. Kick off mining
      const res = await fetch(`${TARGET_URL}/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-load-test-id": USER_ID,
          "idempotency-key": `load-test-idemp-${idx}-${Date.now()}`,
        },
        body: JSON.stringify({
          keyword,
          subreddits: "saas,startups",
          miningDepth: "basic",
        }),
      });

      const latency = Date.now() - start;
      results.latency.push(latency);

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Request ${idx} failed (${res.status}): ${text.slice(0, 100)}`);
        results.failed++;
        return;
      }

      const json = await res.json();
      const scraperId = json.scraperId;
      results.success++;

      // 2. Try to connect to SSE
      const streamStart = Date.now();
      const streamRes = await fetch(`${TARGET_URL}/api/search/stream?id=${scraperId}`, {
        headers: {
          "x-load-test-id": USER_ID,
        },
      });

      if (streamRes.ok && streamRes.body) {
        results.streamStability.push(true);
        // We don't need to consume the whole stream, just verify it opens
        const reader = streamRes.body.getReader();
        const { value } = await reader.read();
        const text = new TextDecoder().decode(value);
        if (text.includes("data:")) {
           // Success
        }
        reader.cancel();
      } else {
        results.streamStability.push(false);
      }

    } catch (err) {
      results.failed++;
      console.error(`💥 Request ${idx} error:`, err);
    }
  });

  await Promise.all(tasks);

  const duration = (Date.now() - startTime) / 1000;
  const avgLatency = results.latency.reduce((a, b) => a + b, 0) / results.latency.length;

  console.log(`\n📊 Load Test Results (${duration.toFixed(2)}s):`);
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏱️ Avg Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`📡 SSE Stability: ${results.streamStability.filter(Boolean).length}/${results.success}`);
  
  if (results.failed > 0) {
    console.log("⚠️ WARNING: Some requests failed. This may indicate connection pool exhaustion or rate limits.");
  } else {
    console.log("🌟 Baseline established: System handled 50 concurrent hits without panic.");
  }
}

runSimulation().catch(console.error);
