/**
 * formatPrice.js
 * Centralized price formatting for AINAI.
 * 
 * Handles conversion from piasters (smallest currency unit) to display units (EGP).
 * Uses Intl.NumberFormat for locale-aware currency display.
 */
export const formatPrice = (amountInPiasters, currency = 'EGP') => {
  if (amountInPiasters === undefined || amountInPiasters === null) return 'EGP 0.00';
  
  const amount = amountInPiasters / 100;
  
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
