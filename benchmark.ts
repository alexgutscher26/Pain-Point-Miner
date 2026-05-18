import { GET } from "./app/api/cron/analyze/route";

async function run() {
  const req = new Request("http://localhost/api/cron/analyze", {
    headers: { Authorization: "Bearer rpp-maintenance-token" }
  });

  const start = performance.now();
  await GET(req);
  const end = performance.now();

  console.log(`Execution time: ${(end - start).toFixed(2)}ms`);
}

run();
