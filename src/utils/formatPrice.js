/**
 * formatPrice.js
 * Centralized price formatting for AINAI.
 *
 * Input: amount in piasters (smallest currency unit, i.e. 1/100 EGP).
 * Output: "1,779.00 EGP" — always 2 decimal places, comma thousands separator.
 *
 * Uses en-US locale (not en-EG) to guarantee comma separators in all browsers.
 */
export const formatPrice = (amountInPiasters, _currency = 'EGP') => {
  if (amountInPiasters == null || isNaN(amountInPiasters)) return '0.00 EGP';
  const num = Number(amountInPiasters) / 100;
  return (
    num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' EGP'
  );
};
