import cron from "node-cron";
import { prisma } from "../lib/prisma";

export async function runAutoValidationNow(): Promise<number> {
  return runAutoValidation();
}

async function runAutoValidation(): Promise<number> {
  const now = new Date();
  let count = 0;

  // ── Étape 1 : prestations A_VALIDER dont le délai est expiré ──────────────
  const expired = await prisma.prestation.findMany({
    where: { status: "A_VALIDER", autoValidateAt: { lte: now } },
    select: { id: true, demandeId: true, demande: { select: { titre: true } } },
  });

  for (const p of expired) {
    try {
      await prisma.prestation.update({
        where: { id: p.id },
        data: { status: "TERMINEE", validatedAt: now },
      });
      await prisma.message.create({
        data: {
          prestationId: p.id,
          contenu: "✅ Tasky-Infos — Prestation validée automatiquement.\n\nLe délai de 3 jours est écoulé sans contestation du client. La prestation est maintenant terminée.",
          isSystem: true,
        },
      });
      console.log(`✅ Prestation ${p.id} → TERMINEE`);
      count++;
    } catch (err) {
      console.error(`❌ Erreur prestation ${p.id}:`, err);
    }
  }

  // ── Étape 2 : rattrapage — demandes encore A_VALIDER dont la prestation est TERMINEE
  const staleDemandes = await prisma.demande.findMany({
    where: {
      status: "A_VALIDER",
      prestation: { status: "TERMINEE" },
    },
    select: { id: true, reference: true },
  });

  if (staleDemandes.length > 0) {
    console.log(`🔄 Rattrapage : ${staleDemandes.length} demande(s) bloquée(s) en A_VALIDER`);

    const { count: updated } = await prisma.demande.updateMany({
      where: {
        status: "A_VALIDER",
        prestation: { status: "TERMINEE" },
      },
      data: { status: "TERMINEE" },
    });

    console.log(`✅ ${updated} demande(s) mise(s) à jour → TERMINEE`);
    for (const d of staleDemandes) {
      console.log(`   → TSK-${String(d.reference).padStart(6, "0")} (${d.id})`);
    }
  }

  if (expired.length === 0 && staleDemandes.length === 0) {
    console.log("⏰ Auto-validation : rien à faire");
  }

  return count;
}

// Toutes les heures à :00
export function startAutoValidateJob() {
  cron.schedule("0 * * * *", async () => {
    try {
      await runAutoValidation();
    } catch (err) {
      console.error("❌ Erreur auto-validation:", err);
    }
  });

  runAutoValidationNow().catch(console.error);
  console.log("⏰ Job auto-validation démarré (toutes les heures)");
}
