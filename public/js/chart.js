// js/chart.js
// Модуль для работы с Chart.js: инициализация и обновление графика курса.

// Храним ссылку на текущий график, чтобы переиспользовать canvas.
let rateChartInstance = null;

/**
 * Генерация псевдо-данных для курса на 7 дней.
 * Можно заменить реальным вызовом API с историческими курсами.
 */
function generateMockRateSeries(baseRate) {
  const data = [];
  let current = baseRate;
  for (let i = 6; i >= 0; i--) {
    const delta = (Math.random() - 0.5) * 0.04 * baseRate;
    current = Math.max(baseRate * 0.75, current + delta);
    data.push(Number(current.toFixed(4)));
  }
  return data;
}

/**
 * Возвращает массив подписей дат за последние 7 дней.
 */
function getLast7DaysLabels() {
  const labels = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    labels.push(label);
  }
  return labels;
}

/**
 * Публичная функция: обновить график для выбранной валюты.
 * @param {HTMLCanvasElement} canvasEl - элемент canvas
 * @param {Object} params
 * @param {string} params.baseCurrency - базовая валюта (например, USD)
 * @param {string} params.targetCurrency - целевая валюта
 * @param {number} params.rate - текущий курс base->target
 */
export function updateRateChart(canvasEl, { baseCurrency, targetCurrency, rate }) {
  if (!canvasEl || !baseCurrency || !targetCurrency || !rate) return;

  const ctx = canvasEl.getContext("2d");

  const labels = getLast7DaysLabels();
  const series = generateMockRateSeries(rate);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvasEl.height);
  gradient.addColorStop(0, "rgba(37, 99, 235, 0.35)");
  gradient.addColorStop(1, "rgba(37, 99, 235, 0)");

  if (rateChartInstance) {
    rateChartInstance.destroy();
  }

  rateChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `Курс ${baseCurrency}/${targetCurrency}`,
          data: series,
          borderColor: "#2563eb",
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointRadius: 2.4,
          pointHoverRadius: 4,
          pointBackgroundColor: "#2563eb",
          pointBorderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y;
              return ` ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
        y: {
          grid: {
            color: "rgba(148, 163, 184, 0.25)",
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
      },
    },
  });
}

/**
 * Заглушка для будущего подключения реального API исторических курсов.
 * Ожидается, что будет возвращать массив чисел длиной 7.
 * Пример интерфейса, который можно реализовать:
 *
 * async function fetchHistoricalRates(base, target) {
 *   const url = `https://api.exchangerate.host/timeseries?start_date=${...}&end_date=${...}&base=${base}&symbols=${target}`;
 *   const resp = await fetch(url);
 *   const data = await resp.json();
 *   // ...преобразовать в [v1, v2, ..., v7]
 * }
 *
 * Сейчас не используется, но оставлено для расширяемости.
 */
export async function fetchHistoricalRatesPlaceholder(base, target) {
  console.info("fetchHistoricalRatesPlaceholder called", base, target);
  return null;
}
