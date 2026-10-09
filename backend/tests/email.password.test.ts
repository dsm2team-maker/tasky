import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { findUserByEmail, emailExists, normalizeEmail } from "../src/utils/email.utils";
import { checkPassword } from "../src/utils/password.policy";

// ── SEC-016 : politique de mot de passe (inscription + reset) ──────────────────
test("reset avec 'a' → refusé (SEC-016)", () => {
  assert.notEqual(checkPassword("a"), null);
  assert.notEqual(checkPassword(undefined), null);
  assert.notEqual(checkPassword(12345678), null);
});

test("mot de passe conforme au formulaire front → accepté", () => {
  assert.equal(checkPassword("Abcdef1!"), null);
  assert.equal(checkPassword("Un-Mot2Passe-Bien-Plus-Long-Que-12"), null);
});

test("chaque règle manquante est refusée, et > 64 caractères aussi", () => {
  assert.notEqual(checkPassword("abcdef1!"), null); // pas de majuscule
  assert.notEqual(checkPassword("ABCDEF1!"), null); // pas de minuscule
  assert.notEqual(checkPassword("Abcdefg!"), null); // pas de chiffre
  assert.notEqual(checkPassword("Abcdefg1"), null); // pas de spécial
  assert.notEqual(checkPassword("Aa1!" + "x".repeat(61)), null);
});

// ── SEC-017 : emails insensibles à la casse (Prisma simulé, aucun accès base) ──
const stubUsers = (rows: { id: string; email: string }[]) => {
  Object.defineProperty(prisma, "user", {
    configurable: true,
    value: {
      findMany: async ({ where }: any) => {
        // Simule un ILIKE naïf où "_" est un joker, pour vérifier le filtre applicatif
        const pattern = new RegExp(
          "^" + where.email.equals.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/_/g, ".") + "$",
          "i",
        );
        return rows.filter((r) => pattern.test(r.email));
      },
    },
  });
};

test("normalizeEmail : trim + minuscules", () => {
  assert.equal(normalizeEmail("  Jean@X.fr "), "jean@x.fr");
});

test("compte historique en majuscules retrouvé avec une saisie en minuscules", async () => {
  stubUsers([{ id: "1", email: "Jean.Dupont@Example.com" }]);
  assert.equal((await findUserByEmail("jean.dupont@example.com"))?.id, "1");
  assert.equal(await emailExists("JEAN.DUPONT@EXAMPLE.COM"), true);
});

test("inscription A@x.fr alors que a@x.fr existe → considéré comme existant (409)", async () => {
  stubUsers([{ id: "1", email: "a@x.fr" }]);
  assert.equal(await emailExists("A@x.fr"), true);
});

test("doublons ne différant que par la casse : correspondance exacte uniquement", async () => {
  stubUsers([
    { id: "1", email: "Jean@x.fr" },
    { id: "2", email: "jean@x.fr" },
  ]);
  assert.equal((await findUserByEmail("Jean@x.fr"))?.id, "1");
  assert.equal((await findUserByEmail("jean@x.fr"))?.id, "2");
  assert.equal((await findUserByEmail("JEAN@x.fr"))?.id, "2"); // repli sur la version minuscule
});

test("un '_' dans l'email ne matche pas un autre compte", async () => {
  stubUsers([{ id: "1", email: "axb@x.fr" }]);
  assert.equal(await findUserByEmail("a_b@x.fr"), null);
  assert.equal(await emailExists("a_b@x.fr"), false);
});

test("saisie vide → null, sans requête", async () => {
  stubUsers([]);
  assert.equal(await findUserByEmail("   "), null);
  assert.equal(await emailExists(undefined), false);
});
