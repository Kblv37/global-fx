// js/countries.js
// Справочник: страна (английское название) -> объект с кодом валюты, названием и ISO2-кодом страны.
// Можно расширять или заменить загрузкой из внешнего JSON.

export const COUNTRY_TO_CURRENCY = [
  { country: "United States", currencyCode: "USD", currencyName: "US Dollar", iso2: "US" },
  { country: "Eurozone", currencyCode: "EUR", currencyName: "Euro", iso2: "EU" },
  { country: "United Kingdom", currencyCode: "GBP", currencyName: "Pound Sterling", iso2: "GB" },
  { country: "Japan", currencyCode: "JPY", currencyName: "Yen", iso2: "JP" },
  { country: "China", currencyCode: "CNY", currencyName: "Yuan Renminbi", iso2: "CN" },
  { country: "Canada", currencyCode: "CAD", currencyName: "Canadian Dollar", iso2: "CA" },
  { country: "Australia", currencyCode: "AUD", currencyName: "Australian Dollar", iso2: "AU" },
  { country: "Switzerland", currencyCode: "CHF", currencyName: "Swiss Franc", iso2: "CH" },
  { country: "Russia", currencyCode: "RUB", currencyName: "Russian Ruble", iso2: "RU" },
  { country: "Uzbekistan", currencyCode: "UZS", currencyName: "Uzbekistani Soʻm", iso2: "UZ" },
  { country: "Kazakhstan", currencyCode: "KZT", currencyName: "Kazakhstani Tenge", iso2: "KZ" },
  { country: "Turkey", currencyCode: "TRY", currencyName: "Turkish Lira", iso2: "TR" },
  { country: "India", currencyCode: "INR", currencyName: "Indian Rupee", iso2: "IN" },
  { country: "Brazil", currencyCode: "BRL", currencyName: "Brazilian Real", iso2: "BR" },
  { country: "Mexico", currencyCode: "MXN", currencyName: "Mexican Peso", iso2: "MX" },
  { country: "Singapore", currencyCode: "SGD", currencyName: "Singapore Dollar", iso2: "SG" },
  { country: "Hong Kong", currencyCode: "HKD", currencyName: "Hong Kong Dollar", iso2: "HK" },
  { country: "South Korea", currencyCode: "KRW", currencyName: "South Korean Won", iso2: "KR" },
  { country: "Saudi Arabia", currencyCode: "SAR", currencyName: "Saudi Riyal", iso2: "SA" },
  { country: "United Arab Emirates", currencyCode: "AED", currencyName: "UAE Dirham", iso2: "AE" },
  { country: "South Africa", currencyCode: "ZAR", currencyName: "South African Rand", iso2: "ZA" },
  { country: "Argentina", currencyCode: "ARS", currencyName: "Argentine Peso", iso2: "AR" },
  { country: "Chile", currencyCode: "CLP", currencyName: "Chilean Peso", iso2: "CL" },
  { country: "Israel", currencyCode: "ILS", currencyName: "New Israeli Shekel", iso2: "IL" },
  { country: "Norway", currencyCode: "NOK", currencyName: "Norwegian Krone", iso2: "NO" },
  { country: "Sweden", currencyCode: "SEK", currencyName: "Swedish Krona", iso2: "SE" },
  { country: "Denmark", currencyCode: "DKK", currencyName: "Danish Krone", iso2: "DK" },
  { country: "Poland", currencyCode: "PLN", currencyName: "Polish Zloty", iso2: "PL" },
  { country: "Czech Republic", currencyCode: "CZK", currencyName: "Czech Koruna", iso2: "CZ" },
  { country: "Hungary", currencyCode: "HUF", currencyName: "Hungarian Forint", iso2: "HU" },
  { country: "Romania", currencyCode: "RON", currencyName: "Romanian Leu", iso2: "RO" },
  { country: "Ukraine", currencyCode: "UAH", currencyName: "Ukrainian Hryvnia", iso2: "UA" },
  { country: "Georgia", currencyCode: "GEL", currencyName: "Georgian Lari", iso2: "GE" },
  { country: "Azerbaijan", currencyCode: "AZN", currencyName: "Azerbaijani Manat", iso2: "AZ" },
  { country: "Kyrgyzstan", currencyCode: "KGS", currencyName: "Kyrgyzstani Som", iso2: "KG" },
  { country: "Tajikistan", currencyCode: "TJS", currencyName: "Tajikistani Somoni", iso2: "TJ" },
  { country: "Turkmenistan", currencyCode: "TMT", currencyName: "Turkmenistani Manat", iso2: "TM" },
  { country: "Pakistan", currencyCode: "PKR", currencyName: "Pakistani Rupee", iso2: "PK" },
  { country: "Indonesia", currencyCode: "IDR", currencyName: "Indonesian Rupiah", iso2: "ID" },
  { country: "Malaysia", currencyCode: "MYR", currencyName: "Malaysian Ringgit", iso2: "MY" },
  { country: "Philippines", currencyCode: "PHP", currencyName: "Philippine Peso", iso2: "PH" },
  { country: "Thailand", currencyCode: "THB", currencyName: "Thai Baht", iso2: "TH" },
  { country: "Vietnam", currencyCode: "VND", currencyName: "Vietnamese Dong", iso2: "VN" },
];

/**
 * Поиск страны по подстроке (регистр не важен).
 * Возвращает первый объект или null.
 */
export function findCountryMatch(query) {
  if (!query) return null;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  return (
    COUNTRY_TO_CURRENCY.find((entry) =>
      entry.country.toLowerCase().includes(normalized)
    ) || null
  );
}
