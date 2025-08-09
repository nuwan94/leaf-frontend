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
      fallbackLocale = 'en'
    } = options;

    // Ensure amount is a number
    const numericAmount = Number(amount || 0);
    
    // Format the number with appropriate decimal places
    const formattedAmount = numericAmount.toFixed(decimals);
    
    if (!showSymbol) {
      return formattedAmount;
    }

    // Use localized currency symbol
    const currency = t('currency', { defaultValue: 'Rs.' });
    
    // Return formatted price with localized currency
    return `${currency} ${formattedAmount}`;
  };

  const formatPriceRange = (min, max, options = {}) => {
    const { decimals = 2 } = options;
    
    const minFormatted = Number(min || 0).toFixed(decimals);
    const maxFormatted = Number(max || 0).toFixed(decimals);
    const currency = t('currency', { defaultValue: 'Rs.' });
    
    return t('priceRange', { 
      min: minFormatted, 
      max: maxFormatted,
      defaultValue: `${currency} ${minFormatted} - ${currency} ${maxFormatted}`
    });
  };

  const getCurrencySymbol = () => {
    return t('currency', { defaultValue: 'Rs.' });
  };

  const getCurrencyCode = () => {
    return t('currencyCode', { defaultValue: 'LKR' });
  };

  const getCurrencyName = () => {
    return t('currencyName', { defaultValue: 'Sri Lankan Rupee' });
  };

  return {
    formatPrice,
    formatPriceRange,
    getCurrencySymbol,
    getCurrencyCode,
    getCurrencyName
  };
}

/**
 * Standalone function for formatting prices without hooks
 * Useful for components that can't use hooks
 */
export function formatCurrency(amount, currencySymbol = 'Rs.', decimals = 2) {
  const numericAmount = Number(amount || 0);
  const formattedAmount = numericAmount.toFixed(decimals);
  return `${currencySymbol} ${formattedAmount}`;
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(currencyString) {
  if (typeof currencyString !== 'string') {
    return Number(currencyString || 0);
  }
  
  // Remove currency symbols and spaces, then parse
  const cleanString = currencyString
    .replace(/Rs\.?|රු\.?|ரூ\.?/g, '') // Remove all currency symbols
    .replace(/[,\s]/g, '') // Remove commas and spaces
    .trim();
    
  return Number(cleanString) || 0;
}