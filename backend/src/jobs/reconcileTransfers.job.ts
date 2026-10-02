import cron from "node-cron";
import { reconcilePendingTransfers } from "../modules/payment/transfer.service";

// Toutes les heures à :30 (décalé de l'auto-validation à :00)
export function startReconcileTransfersJob() {
  cron.schedule("30 * * * *", async () => {
    try {
      const n = await reconcilePendingTransfers();
      if (n > 0) console.log(`💸 Réconciliation transferts : ${n} prestation(s) retraitée(s)`);
    } catch (err) {
      console.error("❌ Erreur réconciliation transferts:", err);
    }
  });
  console.log("💸 Job réconciliation transferts démarré (toutes les heures)");
}
