/**
 * Types pour les catégories de prestations Tasky
 */

/**
 * Prestation individuelle
 */
export interface Prestation {
  id: string;
  nom: string;
}

/**
 * Sous-catégorie contenant plusieurs prestations
 */
export interface SousCategorie {
  id: string;
  nom: string;
  prestations: Prestation[];
}

/**
 * Catégorie principale
 */
export interface Categorie {
  id: string;
  nom: string;
  icon: string;
  description: string;
  sousCategories: SousCategorie[];
}

/**
 * Structure complète du fichier categories.json
 */
export interface CategoriesData {
  categories: Categorie[];
}

/**
 * Type pour la sélection d'une prestation complète
 */
export interface PrestationSelectionnee {
  categorieId: string;
  categorieNom: string;
  sousCategorieId: string;
  sousCategorieNom: string;
  prestationId: string;
  prestationNom: string;
}
