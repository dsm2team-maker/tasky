import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { AddressInfo } from "node:net";
import { requireVerifiedEmail, AuthRequest } from "../src/middleware/auth.middleware";

// Serveur local éphémère : authMiddleware simulé (aucun accès base), seul requireVerifiedEmail est testé
const startApp = (emailVerified: boolean | undefined) => {
  const app = express();
  let handled = 0;
  app.post(
    "/api/demandes",
    (req: AuthRequest, _res, next) => {
      req.user = { userId: "u1", email: "u1@example.com", role: "CLIENT" };
      req.emailVerified = emailVerified;
      next();
    },
    requireVerifiedEmail,
    (_req, res) => {
      handled++;
      res.status(201).json({ success: true });
    },
  );
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  return { server, port, handled: () => handled };
};

test("POST /api/demandes sans email vérifié → 403 EMAIL_NOT_VERIFIED (SEC-006)", async () => {
  const { server, port, handled } = startApp(false);
  try {
    const r = await fetch(`http://127.0.0.1:${port}/api/demandes`, { method: "POST" });
    assert.equal(r.status, 403);
    const body = await r.json();
    assert.equal(body.code, "EMAIL_NOT_VERIFIED");
    assert.equal(handled(), 0);
  } finally {
    server.close();
  }
});

test("emailVerified absent (middleware mal ordonné) → refusé par défaut", async () => {
  const { server, port, handled } = startApp(undefined);
  try {
    const r = await fetch(`http://127.0.0.1:${port}/api/demandes`, { method: "POST" });
    assert.equal(r.status, 403);
    assert.equal(handled(), 0);
  } finally {
    server.close();
  }
});

test("email vérifié → action autorisée", async () => {
  const { server, port, handled } = startApp(true);
  try {
    const r = await fetch(`http://127.0.0.1:${port}/api/demandes`, { method: "POST" });
    assert.equal(r.status, 201);
    assert.equal(handled(), 1);
  } finally {
    server.close();
  }
});
