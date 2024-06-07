import os from "node:os";

const MAX_COPIES = 5;
const numCopies = Math.min(os.cpus().length, MAX_COPIES);
for (let i = 0; i < numCopies; i++) {
  Bun.spawn(["bun", "server/entry.bun.js"], {
    stdio: ["inherit", "inherit", "inherit"],
    env: { ...process.env },
  });
}
