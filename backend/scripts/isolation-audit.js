// Run with: node scripts/isolation-audit.js   (server must be running)
const BASE = "http://localhost:5000/api/transactions";
const ROUNDS = 25;

const call = async (path, tenant) => {
  const start = Date.now();
  const res = await fetch(`${BASE}${path}`, { headers: { "x-tenant-id": tenant } });
  const body = await res.json();
  return { status: res.status, body, ms: Date.now() - start };
};

(async () => {
  let failures = 0;
  let totalMs = 0;
  let calls = 0;

  // Learn which eventIds belong to company A
  const a = await call("?limit=100", "companya");
  const aEvents = new Set(a.body.data.transactions.map((t) => t.eventId));

  for (let i = 1; i <= ROUNDS; i++) {
    // Switch tenants on every call (parallel = "under load")
    const [ra, rb, rl] = await Promise.all([
      call("/balance/ACC001", "companya"),
      call("/balance/ACC001", "companyb"),
      call("?limit=100", "companyb"),
    ]);
    totalMs += ra.ms + rb.ms + rl.ms;
    calls += 3;

    const okA = ra.status === 200;
    const okB = rb.status === 404; // B must not see A's account
    const leaked = rl.body.data.transactions.some((t) => aEvents.has(t.eventId));

    if (!okA || !okB || leaked) {
      failures++;
      console.log(`Round ${i}: FAIL (A=${ra.status}, B=${rb.status}, leaked=${leaked})`);
    }
  }

  console.log("-----------------------------");
  console.log(`Rounds: ${ROUNDS}, requests: ${calls}`);
  console.log(`Average response time: ${(totalMs / calls).toFixed(1)} ms`);
  console.log(failures === 0 ? "ISOLATION AUDIT PASSED: no cross-tenant data" : `ISOLATION AUDIT FAILED: ${failures} round(s)`);
})();