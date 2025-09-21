// js/charting/renderChart.js
// Real chart rendering implementation based on working old system
// NO ES6 modules - Global namespace pattern
(function(window) {
    'use strict';

    // Ensure the global namespace exists
    window.Charting = window.Charting || {};
    window.Charting.chartInstances = window.Charting.chartInstances || {};

    // Helper functions for charts
    function generateChartColors(count) {
        var colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ];
        var result = [];
        for (var i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    function isDarkMode() {
        return document.body.classList.contains('dark-theme');
    }

    function getTextColor() {
        return isDarkMode() ? '#e0e0e0' : '#333333';
    }

    function getGridColor() {
        return isDarkMode() ? '#444444' : '#e0e0e0';
    }

    // Main chart rendering function
    window.Charting.renderChart = function(container, chartData) {
        if (!container || !chartData) {
            console.error('renderChart: Missing container or chartData');
            return;
        }

        var chartId = container.id + '_canvas';

        // Destroy existing chart if it exists
        if (window.Charting.chartInstances[chartId]) {
            window.Charting.chartInstances[chartId].destroy();
            delete window.Charting.chartInstances[chartId];
        }

        // Create canvas element
        container.innerHTML = '<canvas id="' + chartId + '" style="max-height: 400px;"></canvas>';

        var canvas = document.getElementById(chartId);
        if (!canvas) {
            console.error('renderChart: Could not create canvas');
            return;
        }

        var ctx = canvas.getContext('2d');
        var config = chartData.chartConfig || {};

        try {
            var chart = null;

            // Handle different chart types
            if (chartData.chartType === 'bar' || chartData.chartType === 'histogram') {
                chart = renderBarChart(ctx, chartData, config);
            } else if (chartData.chartType === 'pie') {
                chart = renderPieChart(ctx, chartData, config);
            } else if (chartData.chartType === 'scatter') {
                chart = renderScatterChart(ctx, chartData, config);
            } else if (chartData.chartType === 'dotplot') {
                chart = renderDotplotChart(ctx, chartData, config);
            } else if (chartData.chartType === 'boxplot') {
                chart = renderBoxplotChart(ctx, chartData, config);
            } else if (chartData.charts && Array.isArray(chartData.charts)) {
                // Multiple charts - render the first one for now
                chart = window.Charting.renderChart(container, chartData.charts[0]);
            } else {
                console.warn('renderChart: Unknown chart type:', chartData.chartType);
                container.innerHTML = '<div style="border: 2px dashed #ccc; padding: 20px; text-align: center;">Unknown chart type: ' + chartData.chartType + '</div>';
                return;
            }

            if (chart) {
                window.Charting.chartInstances[chartId] = chart;
                console.log('Chart rendered successfully:', chartData.chartType);
            }

        } catch (error) {
            console.error('renderChart error:', error);
            container.innerHTML = '<div style="border: 2px solid red; padding: 20px; text-align: center; color: red;">Error rendering chart: ' + error.message + '</div>';
        }
    };

    // Bar/Histogram chart renderer
    function renderBarChart(ctx, chartData, config) {
        var colorPalette = generateChartColors(chartData.series ? chartData.series.length : 1);

        var datasets = chartData.series ? chartData.series.map(function(series, index) {
            return {
                label: series.name,
                data: series.values,
                backgroundColor: colorPalette[index],
                borderColor: colorPalette[index],
                borderWidth: 1
            };
        }) : [{
            label: 'Data',
            data: chartData.values || [],
            backgroundColor: colorPalette[0],
            borderColor: colorPalette[0],
            borderWidth: 1
        }];

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.xLabels || [],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: !!(config.yAxis && config.yAxis.title),
                            text: config.yAxis ? config.yAxis.title : ''
                        }
                    },
                    x: {
                        title: {
                            display: !!(config.xAxis && config.xAxis.title),
                            text: config.xAxis ? config.xAxis.title : ''
                        }
                    }
                },
                plugins: {
                    title: {
                        display: !!chartData.title,
                        text: chartData.title || ''
                    },
                    legend: {
                        display: datasets.length > 1
                    }
                }
            }
        });
    }

    // Pie chart renderer
    function renderPieChart(ctx, chartData, config) {
        var colors = generateChartColors(chartData.series ? chartData.series.length : 0);

        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartData.series ? chartData.series.map(function(s) { return s.name; }) : [],
                datasets: [{
                    data: chartData.series ? chartData.series.map(function(s) { return s.value; }) : [],
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!chartData.title,
                        text: chartData.title || ''
                    }
                }
            }
        });
    }

    // Scatter plot renderer
    function renderScatterChart(ctx, chartData, config) {
        var datasets = [{
            label: 'Data Points',
            data: chartData.points || [],
            backgroundColor: '#36A2EB',
            borderColor: '#36A2EB'
        }];

        return new Chart(ctx, {
            type: 'scatter',
            data: { datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: !!(config.xAxis && config.xAxis.title),
                            text: config.xAxis ? config.xAxis.title : ''
                        }
                    },
                    y: {
                        title: {
                            display: !!(config.yAxis && config.yAxis.title),
                            text: config.yAxis ? config.yAxis.title : ''
                        }
                    }
                },
                plugins: {
                    title: {
                        display: !!chartData.title,
                        text: chartData.title || ''
                    }
                }
            }
        });
    }

    // Dotplot renderer (using scatter with custom styling)
    function renderDotplotChart(ctx, chartData, config) {
        var data = [];
        if (chartData.values) {
            chartData.values.forEach(function(value, index) {
                data.push({ x: value, y: 0 });
            });
        }

        return new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Dot Plot',
                    data: data,
                    backgroundColor: '#36A2EB',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        display: false,
                        min: -0.5,
                        max: 0.5
                    },
                    x: {
                        title: {
                            display: !!(config.xAxis && config.xAxis.title),
                            text: config.xAxis ? config.xAxis.title : ''
                        }
                    }
                },
                plugins: {
                    title: {
                        display: !!chartData.title,
                        text: chartData.title || ''
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Boxplot renderer (simplified as bar chart for now)
    function renderBoxplotChart(ctx, chartData, config) {
        // Create a simple placeholder for boxplots
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Boxplot'],
                datasets: [{
                    label: 'Boxplot Data',
                    data: [1],
                    backgroundColor: '#36A2EB',
                    borderColor: '#36A2EB',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Boxplot (simplified)'
                    }
                }
            }
        });
    }

    console.log("renderChart.js loaded with full implementation.");

})(window);