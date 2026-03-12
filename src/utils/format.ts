/**
 * Formate un montant en euros avec le format français
 * @param amount - Montant à formater
 * @param decimals - Nombre de décimales (défaut: 0)
 * @returns Montant formaté avec espace insécable avant €
 */
export function formatCurrency(amount: number, decimals: number = 0): string {
  const formatted = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} €`;
}

/**
 * Formate un nombre avec le format français (espaces comme séparateurs de milliers)
 * @param value - Nombre à formater
 * @returns Nombre formaté
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('fr-FR');
}
