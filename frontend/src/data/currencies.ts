/**
 * Common ISO 4217 currencies for admin section pricing (display + select options).
 */

export type CurrencyOption = { code: string; label: string };

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', label: 'USD — US dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British pound' },
  { code: 'ILS', label: 'ILS — Israeli shekel' },
  { code: 'JPY', label: 'JPY — Japanese yen' },
  { code: 'CHF', label: 'CHF — Swiss franc' },
  { code: 'CAD', label: 'CAD — Canadian dollar' },
  { code: 'AUD', label: 'AUD — Australian dollar' },
  { code: 'NZD', label: 'NZD — New Zealand dollar' },
  { code: 'SEK', label: 'SEK — Swedish krona' },
  { code: 'NOK', label: 'NOK — Norwegian krone' },
  { code: 'DKK', label: 'DKK — Danish krone' },
  { code: 'PLN', label: 'PLN — Polish złoty' },
  { code: 'CZK', label: 'CZK — Czech koruna' },
  { code: 'HUF', label: 'HUF — Hungarian forint' },
  { code: 'CNY', label: 'CNY — Chinese yuan' },
  { code: 'HKD', label: 'HKD — Hong Kong dollar' },
  { code: 'SGD', label: 'SGD — Singapore dollar' },
  { code: 'INR', label: 'INR — Indian rupee' },
  { code: 'KRW', label: 'KRW — South Korean won' },
  { code: 'MXN', label: 'MXN — Mexican peso' },
  { code: 'BRL', label: 'BRL — Brazilian real' },
  { code: 'ZAR', label: 'ZAR — South African rand' },
  { code: 'TRY', label: 'TRY — Turkish lira' },
  { code: 'AED', label: 'AED — UAE dirham' },
  { code: 'SAR', label: 'SAR — Saudi riyal' },
];
