import { resolveProblemPatterns } from "./lib/reddit";
import { performance } from "perf_hooks";

const ITERATIONS = 10000;
const customPatterns = Array.from(
  { length: 1000 },
  (_, i) => `pattern${i % 100}`,
);

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  resolveProblemPatterns(customPatterns);
}
const end = performance.now();

console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
