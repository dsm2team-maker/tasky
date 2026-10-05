import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { AddressInfo } from "node:net";
import { emailSendIpLimiter, emailSendTargetLimiter } from "../src/middleware/rateLimit.middleware";

// Serveur local éphémère : aucun appel réseau externe, aucun email envoyé
test("forgot-password : la 6e demande pour le même email en 1 h → 429 (SEC-015)", async () => {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json());
  let handled = 0;
  app.post("/forgot-password", emailSendIpLimiter, emailSendTargetLimiter, (_req, res) => {
    handled++;
    res.json({ success: true });
  });

  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  const post = (email: string, ip = "203.0.113.10") =>
    fetch(`http://127.0.0.1:${port}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
      body: JSON.stringify({ email }),
    }).then((r) => r.status);

  try {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push(await post("Victime@Example.com "));
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
    assert.equal(handled, 5);

    // Casse/espaces différents = même cible
    assert.equal(await post("victime@example.com"), 429);
    // Autre email depuis la même IP : toujours autorisé
    assert.equal(await post("autre@example.com"), 200);
    // Même email depuis une autre IP (trust proxy) : compteur distinct
    assert.equal(await post("victime@example.com", "198.51.100.7"), 200);
  } finally {
    server.close();
  }
});
