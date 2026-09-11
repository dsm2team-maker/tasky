import cron from "node-cron";
import { prisma } from "../lib/prisma";

export async function runExpireDevisNow(): Promise<number> {
  return runExpireDevis();
}

async function runExpireDevis(): Promise<number> {
  const now = new Date();

  const { count } = await prisma.devis.updateMany({
    where: { status: "ENVOYE", expiresAt: { lte: now } },
    data: { status: "EXPIRE", estSelectionnable: false },
  });

  if (count > 0) {
    console.log(`⌛ ${count} devis expiré(s) → EXPIRE`);
  }

  return count;
}

// Toutes les heures à :15
export function startExpireDevisJob() {
  cron.schedule("15 * * * *", async () => {
    try {
      await runExpireDevis();
    } catch (err) {
      console.error("❌ Erreur expiration devis:", err);
    }
  });

  runExpireDevisNow().catch(console.error);
  console.log("⌛ Job expiration devis démarré (toutes les heures)");
}
