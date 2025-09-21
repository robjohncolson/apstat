/**
   * DO NOT MODIFY - GOLDEN CODE
   * Chart instance registry for managing Chart.js instances
   * Extracted from index.html global variables
   */

  // Global chart instances registry
  let chartInstances = {};

  export function getChartInstance(chartId) {
      return chartInstances[chartId];
  }

  export function setChartInstance(chartId, chartInstance) {
      chartInstances[chartId] = chartInstance;
  }

  export function destroyChartInstance(chartId) {
      if (chartInstances[chartId]) {
          chartInstances[chartId].destroy();
          delete chartInstances[chartId];
      }
  }

  export function getAllChartInstances() {
      return chartInstances;
  }

  export function clearAllCharts() {
      Object.values(chartInstances).forEach(chart => chart.destroy());
      chartInstances = {};
  }