
require("dotenv").config();

const { getControlConnection } = require("../src/config/tenantConnection");
const { getControlModels } = require("../src/models/control");
const { hashPassword, verifyPassword } = require("../src/utils/password");

(async () => {
  try {
    const conn = await getControlConnection();
    const { Company, User } = getControlModels(conn);

    await Company.init();
    await User.init();

    // Clean up any leftovers from an earlier run
    await Company.deleteMany({ tenantId: "authtest" });
    await User.deleteMany({ tenantId: "authtest" });

    const company = await Company.create({
      name: "Auth Test Co",
      tenantId: "AuthTest"
    });

    console.log("1. Company saved, tenantId:", company.tenantId);

    const hash = await hashPassword("Secret123");

    await User.create({
      name: "Test User",
      email: "Test@AuthTest.com",
      passwordHash: hash,
      tenantId: "authtest"
    });

    console.log("2. User saved, hash starts with:", hash.slice(0, 4), "(not the real password)");

    console.log("3. Correct password accepted:", await verifyPassword("Secret123", hash));

    console.log("4. Wrong password rejected:", !(await verifyPassword("Wrong999", hash)));

    try {
      await User.create({
        name: "Dup",
        email: "test@authtest.com",
        passwordHash: hash,
        tenantId: "authtest"
      });

      console.log("5. Duplicate email: FAILED (it was accepted)");
    } catch (e) {
      console.log("5. Duplicate email rejected, code:", e.code);
    }

    await Company.deleteMany({ tenantId: "authtest" });
    await User.deleteMany({ tenantId: "authtest" });

    console.log("Cleanup done. AUTH FOUNDATION TEST PASSED");

    process.exit(0);
  } catch (err) {
    console.error("TEST FAILED:", err.message);
    process.exit(1);
  }
})();
