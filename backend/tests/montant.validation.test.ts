import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMontant, parseDelai, parsePhotos } from "../src/utils/montant.validation";

test("montants valides acceptés (nombre ou chaîne)", () => {
  assert.equal(parseMontant(45), 45);
  assert.equal(parseMontant("45.5"), 45.5);
  assert.equal(parseMontant(19.99), 19.99);
  assert.equal(parseMontant(5), 5);
  assert.equal(parseMontant(1_500), 1_500);
});

test("montants hors bornes ou mal formés refusés (SEC-012 / SEC-013)", () => {
  for (const v of [0, 0.01, 0.5, 1, 4.99, -50, "-50", 1_500.01, 50_000, 1e308, Infinity, NaN, "1e3", "12,50", 12.345, "abc", "", null, undefined, {}, [45], true]) {
    assert.equal(parseMontant(v), null, `devrait refuser ${String(v)}`);
  }
});

test("délai : entier entre 1 et 90 jours", () => {
  assert.equal(parseDelai(5), 5);
  assert.equal(parseDelai(90), 90);
  assert.equal(parseDelai("7"), 7);
  for (const v of [0, -1, 91, 365, 2.5, "abc", null, undefined]) {
    assert.equal(parseDelai(v), null, `devrait refuser ${String(v)}`);
  }
});

test("photos : uniquement le stockage public Supabase du projet", () => {
  const base = "https://abc.supabase.co";
  const ok = `${base}/storage/v1/object/public/etats/photo.jpg`;
  assert.deepEqual(parsePhotos(undefined, base), []);
  assert.deepEqual(parsePhotos([], base), []);
  assert.deepEqual(parsePhotos([ok], base), [ok]);
  assert.equal(parsePhotos(["https://evil.example/x.jpg"], base), null);
  assert.equal(parsePhotos([`${base}/storage/v1/object/public/../../x`], base), null);
  assert.equal(parsePhotos([ok], undefined), null);
  assert.equal(parsePhotos("pas un tableau", base), null);
  assert.equal(parsePhotos(Array(11).fill(ok), base), null);
});
