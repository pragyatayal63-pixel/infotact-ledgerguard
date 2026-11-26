
// Run with: node scripts/isolation-audit.js (server must be running)
const BASE = "http://localhost:5000/api";

const USERS = {
  a: { email: "admin@companya.test", password: "Secret123" },
  b: { email: "admin@companyb.test", password: "Secret123" },
};

const ROUNDS = 25;

const login = async (user) => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  const body = await res.json();

  if (!body.success) {
    throw new Error("Login failed: " + JSON.stringify(body));
  }

  return body.data.token;
};

const call = async (path, token) => {
  const start = Date.now();

  const res = await fetch(`${BASE}/transactions${path}`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });

  return {
    status: res.status,
    body: await res.json(),
    ms: Date.now() - start,
  };
};

(async () => {
  let failures = 0;
  let totalMs = 0;
  let calls = 0;

  const tokenA = await login(USERS.a);
  const tokenB = await login(USERS.b);

  // No token and tampered token must be rejected
  const none = await call("/balance/ACC001", null);
  const bad = await call("/balance/ACC001", tokenA + "x");

  console.log(`No token -> ${none.status} (expected 401)`);
  console.log(`Tampered token -> ${bad.status} (expected 401)`);

  if (none.status !== 401 || bad.status !== 401) {
    failures++;
  }

  // Learn which eventIds belong to Company A
  const a = await call("?limit=100", tokenA);
  const aEvents = new Set(
    a.body.data.transactions.map((t) => t.eventId)
  );

  for (let i = 1; i <= ROUNDS; i++) {
    // Send requests for both tenants in parallel
    const [ra, rb, rl] = await Promise.all([
      call("/balance/ACC001", tokenA),
      call("/balance/ACC001", tokenB),
      call("?limit=100", tokenB),
    ]);

    totalMs += ra.ms + rb.ms + rl.ms;
    calls += 3;

    const leaked = rl.body.data.transactions.some(
      (t) => aEvents.has(t.eventId)
    );

    if (ra.status !== 200 || rb.status !== 200 || leaked) {
      failures++;
      console.log(
        `Round ${i}: FAIL (A=${ra.status}, B=${rb.status}, leaked=${leaked})`
      );
    }
  }

  console.log("-----------------------------");
  console.log(`Rounds: ${ROUNDS}, requests: ${calls}`);
  console.log(
    `Average response time: ${(totalMs / calls).toFixed(1)} ms`
  );

  console.log(
    failures === 0
      ? "ISOLATION AUDIT PASSED: no cross-tenant data"
      : `ISOLATION AUDIT FAILED: ${failures} problem(s)`
  );
})();
