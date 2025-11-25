// js/app.js
// Главный модуль приложения: конвертер, история, тема, поиск по стране, интеграция с Chart.js.

// Импорт модулей
import { updateRateChart } from "./chart.js";
import { COUNTRY_TO_CURRENCY, findCountryMatch } from "./countries.js";

// === Константы и ключи ===

// Основной API для курсов валют.
// Здесь указана open.er-api.com, но можно заменить на любой другой.
// Ожидается формат: { base_code: "USD", rates: { EUR: 0.9, ... } }
const RATES_API_URL = "https://open.er-api.com/v6/latest/USD";

// Альтернативы (для дальнейшего расширения проекта):
// - https://api.exchangerate.host/latest?base=USD
// - https://openexchangerates.org/ (требуется ключ)

// Ключи для localStorage
const LS_THEME_KEY = "currency-converter-theme";
const LS_HISTORY_KEY = "currency-converter-history";
const LS_SETTINGS_KEY = "currency-converter-settings";

// Максимальный размер истории
const HISTORY_MAX_ITEMS = 50;

// === Состояние приложения ===
const state = {
  base: "USD",
  rates: {}, // объект вида { "EUR": 0.92, "UZS": 12600, ... }
  lastUpdated: null,
  selectedFrom: "USD",
  selectedTo: "EUR",
};

// === DOM-элементы ===
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");
const resultValueEl = document.getElementById("resultValue");
const resultMetaEl = document.getElementById("resultMeta");
const swapButton = document.getElementById("swapButton");

const countrySearchInput = document.getElementById("countrySearch");
const countryMatchInfo = document.getElementById("countryMatchInfo");

const historyList = document.getElementById("historyList");
const historyEmptyState = document.getElementById("historyEmptyState");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const exportCsvButton = document.getElementById("exportCsvButton");

const themeToggleHeader = document.getElementById("themeToggle");
const themeToggleFooter = document.getElementById("themeToggleFooter");
const themeToggleIconHeader = document.getElementById("themeToggleIcon");
const themeToggleIconFooter = themeToggleFooter.querySelector(".theme-toggle-icon");
const rateChartCanvas = document.getElementById("rateChart");

// === Вспомогательные функции ===

/**
 * Форматирование чисел с максимум 4 знаками после запятой.
 */
function formatNumber(value, maxFractionDigits = 4) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

/**
 * Загружает историю из localStorage.
 */
function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Failed to parse history from localStorage", e);
    return [];
  }
}

/**
 * Сохраняет историю в localStorage.
 */
function saveHistory(history) {
  try {
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history", e);
  }
}

/**
 * Добавляет запись в историю конвертаций.
 */
function addHistoryEntry({ amount, from, to, rate, result }) {
  const history = loadHistory();
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    amount,
    from,
    to,
    rate,
    result,
  };
  const newHistory = [entry, ...history].slice(0, HISTORY_MAX_ITEMS);
  saveHistory(newHistory);
  renderHistory(newHistory);
}

/**
 * Очистка истории.
 */
function clearHistory() {
  saveHistory([]);
  renderHistory([]);
}

/**
 * Рендер списка истории в DOM.
 */
function renderHistory(history) {
  historyList.innerHTML = "";
  if (!history || history.length === 0) {
    historyEmptyState.style.display = "block";
    return;
  }
  historyEmptyState.style.display = "none";

  for (const item of history) {
    const li = document.createElement("li");
    li.className = "history-item";

    const main = document.createElement("div");
    main.className = "history-main";

    const amountLine = document.createElement("div");
    amountLine.className = "history-amount";
    amountLine.textContent = `${formatNumber(item.amount)} ${item.from} → ${formatNumber(
      item.result
    )} ${item.to}`;

    const rateLine = document.createElement("div");
    rateLine.className = "history-rate";
    rateLine.textContent = `Курс: 1 ${item.from} = ${formatNumber(
      item.rate,
      6
    )} ${item.to}`;

    main.appendChild(amountLine);
    main.appendChild(rateLine);

    const meta = document.createElement("div");
    meta.className = "history-meta";
    const date = new Date(item.timestamp);
    meta.textContent = date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    li.appendChild(main);
    li.appendChild(meta);
    historyList.appendChild(li);
  }
}

/**
 * Экспорт истории в CSV и скачивание файла.
 */
function exportHistoryToCsv() {
  const history = loadHistory();
  if (!history.length) return;

  const header = ["timestamp", "amount", "from", "to", "rate", "result"];
  const rows = [header.join(";")];

  for (const item of history) {
    const row = [
      item.timestamp,
      item.amount,
      item.from,
      item.to,
      item.rate,
      item.result,
    ].join(";");
    rows.push(row);
  }

  const blob = new Blob([rows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `currency-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Сохраняет пользовательские настройки (последние валюты и сумму).
 */
function saveSettings() {
  const settings = {
    from: state.selectedFrom,
    to: state.selectedTo,
    lastAmount: Number(amountInput.value) || null,
  };
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
}

/**
 * Загружает пользовательские настройки.
 */
function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (!raw) return null;
    const settings = JSON.parse(raw);
    return settings;
  } catch (e) {
    console.error("Failed to load settings", e);
    return null;
  }
}

// === Работа с темой ===

function applyTheme(theme) {
  const normalized = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", normalized);
  try {
    localStorage.setItem(LS_THEME_KEY, normalized);
  } catch (e) {
    console.error("Failed to store theme", e);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
}

function initTheme() {
  const stored = localStorage.getItem(LS_THEME_KEY);
  if (stored === "dark" || stored === "light") {
    applyTheme(stored);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }
}

// === API курсов валют ===

/**
 * Загрузка курсов валют с API.
 * Базовая валюта фиксирована как USD в данном API.
 */
async function fetchRates() {
  try {
    const resp = await fetch(RATES_API_URL);
    const data = await resp.json();
    if (data.result !== "success") {
      throw new Error("API returned non-success result");
    }
    state.base = data.base_code;
    state.rates = data.rates;
    state.lastUpdated = data.time_last_update_utc;
    return data;
  } catch (e) {
    console.error("Failed to fetch rates", e);
    resultMetaEl.textContent =
      "Не удалось загрузить курсы. Проверьте подключение к интернету.";
    throw e;
  }
}

/**
 * Возвращает список кодов валют из загруженных курсов.
 */
function getCurrencyCodes() {
  return Object.keys(state.rates).sort();
}

/**
 * Заполняет select-элементы валютами.
 */
function populateCurrencySelects() {
  const codes = getCurrencyCodes();
  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";

  for (const code of codes) {
    const optionFrom = document.createElement("option");
    optionFrom.value = code;
    optionFrom.textContent = code;
    fromSelect.appendChild(optionFrom);

    const optionTo = document.createElement("option");
    optionTo.value = code;
    optionTo.textContent = code;
    toSelect.appendChild(optionTo);
  }

  // Поставим по умолчанию пару, исходя из предпочтений или дефолта.
  const storedSettings = loadSettings();
  if (storedSettings && codes.includes(storedSettings.from) && codes.includes(storedSettings.to)) {
    state.selectedFrom = storedSettings.from;
    state.selectedTo = storedSettings.to;
    fromSelect.value = storedSettings.from;
    toSelect.value = storedSettings.to;
    if (typeof storedSettings.lastAmount === "number" && storedSettings.lastAmount > 0) {
      amountInput.value = storedSettings.lastAmount;
    }
  } else {
    state.selectedFrom = "USD";
    state.selectedTo = codes.includes("UZS") ? "UZS" : "EUR";
    fromSelect.value = state.selectedFrom;
    toSelect.value = state.selectedTo;
    amountInput.value = "100";
  }
}

/**
 * Получить курс from->to из state.
 * Базовая валюта — state.base (обычно USD).
 */
function getRate(from, to) {
  const base = state.base; // например, "USD"
  if (from === to) return 1;
  if (!state.rates || !state.rates[from] || !state.rates[to]) return null;

  // Курсы относительно base:
  const rateBaseToFrom = state.rates[from];
  const rateBaseToTo = state.rates[to];

  // 1 from = (rateBaseToTo / rateBaseToFrom) to
  return rateBaseToTo / rateBaseToFrom;
}

/**
 * Основная функция пересчёта и отображения результата.
 */
function recalculateAndRender(shouldAddHistory = false) {
  const amount = Number(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (!Number.isFinite(amount) || amount <= 0) {
    resultValueEl.textContent = "—";
    resultMetaEl.textContent = "Введите сумму больше нуля.";
    return;
  }

  const rate = getRate(from, to);
  if (!rate) {
    resultValueEl.textContent = "—";
    resultMetaEl.textContent = "Курс недоступен для выбранной пары валют.";
    return;
  }

  const result = amount * rate;
  resultValueEl.textContent = `${formatNumber(result)} ${to}`;
  resultMetaEl.textContent = `1 ${from} = ${formatNumber(rate, 6)} ${to}`;

  if (shouldAddHistory) {
    addHistoryEntry({ amount, from, to, rate, result });
  }

  saveSettings();

  // Обновить график
  updateRateChart(rateChartCanvas, {
    baseCurrency: from,
    targetCurrency: to,
    rate,
  });
}

// === Поиск валюты по стране ===

function handleCountryInput() {
  const query = countrySearchInput.value;
  const match = findCountryMatch(query);

  if (!match) {
    countryMatchInfo.textContent = "Страна не найдена в справочнике.";
    return;
  }

  countryMatchInfo.textContent = `${match.country}: ${match.currencyName} (${match.currencyCode})`;

  // Если валюта есть в списке курсов — обновляем селектор "в валюту" и пересчитываем
  const codes = getCurrencyCodes();
  if (codes.includes(match.currencyCode)) {
    toSelect.value = match.currencyCode;
    state.selectedTo = match.currencyCode;
    recalculateAndRender(false);
  }
}

// === Инициализация ===

async function init() {
  initTheme();

  // Слушатели смены темы
  themeToggleHeader.addEventListener("click", toggleTheme);
  themeToggleFooter.addEventListener("click", toggleTheme);

  // История: первичный рендер
  renderHistory(loadHistory());

  // Слушатели истории
  clearHistoryButton.addEventListener("click", () => {
    clearHistory();
  });
  exportCsvButton.addEventListener("click", () => {
    exportHistoryToCsv();
  });

  // Слушатели конвертера
  swapButton.addEventListener("click", () => {
    const tmp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tmp;
    state.selectedFrom = fromSelect.value;
    state.selectedTo = toSelect.value;
    recalculateAndRender(false);
  });

  fromSelect.addEventListener("change", () => {
    state.selectedFrom = fromSelect.value;
    recalculateAndRender(false);
  });

  toSelect.addEventListener("change", () => {
    state.selectedTo = toSelect.value;
    recalculateAndRender(false);
  });

  amountInput.addEventListener("input", () => {
    recalculateAndRender(false);
  });

  // Слушатель поиска по стране (debounce можно добавить при желании)
  countrySearchInput.addEventListener("input", handleCountryInput);

  try {
    await fetchRates();
    populateCurrencySelects();
    recalculateAndRender(false);
    if (state.lastUpdated) {
      resultMetaEl.textContent += ` · Обновлено: ${state.lastUpdated}`;
    }
  } catch (e) {
    console.error("Failed to initialize app:", e);
  }

  // Первый рендер истории графика на случай, если amount уже есть
  recalculateAndRender(false);
}

// Запуск
document.addEventListener("DOMContentLoaded", init);
