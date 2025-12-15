/**
 * Utilitaires pour la gestion de la devise (FCFA - Franc CFA)
 * Plateforme gabonaise utilisant le FCFA
 */

export const CURRENCY_SYMBOL = 'FCFA';
export const CURRENCY_CODE = 'XAF'; // Code ISO pour le Franc CFA

/**
 * Formate un montant en FCFA avec séparateurs de milliers
 * @param amount - Montant en centimes ou en FCFA entier
 * @param includeSymbol - Inclure le symbole FCFA (défaut: true)
 * @param fromCentimes - Le montant est en centimes (défaut: false)
 * @returns Montant formatté (ex: "5 000 FCFA")
 */
export const formatCurrency = (
  amount: number | string,
  includeSymbol: boolean = true,
  fromCentimes: boolean = false
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return includeSymbol ? `0 ${CURRENCY_SYMBOL}` : '0';
  }

  // Convertir centimes en FCFA si nécessaire
  const finalAmount = fromCentimes ? numAmount / 100 : numAmount;

  // Formater avec séparateurs d'espaces (standard français)
  const formatted = Math.round(finalAmount).toLocaleString('fr-FR');

  return includeSymbol ? `${formatted} ${CURRENCY_SYMBOL}` : formatted;
};

/**
 * Parse un montant en FCFA vers un nombre
 * @param value - Valeur à parser (ex: "5 000 FCFA" ou "5000")
 * @returns Nombre en FCFA
 */
export const parseCurrency = (value: string): number => {
  // Supprimer tous les caractères non numériques sauf le point et la virgule
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Convertit un montant en centimes pour stockage backend
 * @param amount - Montant en FCFA
 * @returns Montant en centimes
 */
export const toCentimes = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convertit un montant en centimes vers FCFA
 * @param centimes - Montant en centimes
 * @returns Montant en FCFA
 */
export const fromCentimes = (centimes: number): number => {
  return centimes / 100;
};
