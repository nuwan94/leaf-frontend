import { useTranslation } from 'react-i18next';

/**
 * Currency formatting utility for Sri Lankan Rupees
 * Supports localization across English, Sinhala, and Tamil
 */

export function useCurrency() {
  const { t } = useTranslation();

  const formatPrice = (amount, options = {}) => {
    const {
      showSymbol = true,
      decimals = 2,
    } = options;

    // Ensure amount is a number
    const numericAmount = Number(amount || 0);
    
    // Format the number with appropriate decimal places
    const formattedAmount = numericAmount.toFixed(decimals);
    
    if (!showSymbol) {
      return formattedAmount;
    }

    // Use localized currency symbol
    const currency = t('Rs', { defaultValue: 'Rs.' });
    
    // Return formatted price with localized currency
    return `${currency} ${formattedAmount}`;
  };

  return {
    formatPrice,
  };
}
