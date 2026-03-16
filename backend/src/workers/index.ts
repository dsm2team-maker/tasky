// Démarrer le worker email avec le serveur
// Ajouter cet import dans backend/src/index.ts

import "./workers/email.worker";

// Le worker se lance automatiquement et écoute la queue Redis
// Il traitera tous les jobs email en arrière-plan
