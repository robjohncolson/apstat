/**
   * Enhanced wrapper for renderChart with additional features
   * Uses the golden renderChart function + adds new capabilities
   */
import { renderChart } from '../renderers/charts/renderChart.js';

export class ChartWrapper {

    // Basic wrapper - uses original renderChart
    render(chartData, questionId) {
        return renderChart(chartData, questionId);
    }

    // Enhanced version with peer data overlay
    renderWithPeerOverlay(chartData, questionId, peerData) {
        // First render the original chart
        const originalHtml = renderChart(chartData, questionId);

        // Add peer data visualization on top
        const peerOverlay = this.createPeerOverlay(peerData);

        return originalHtml + peerOverlay;
    }

    // Enhanced version with real-time updates
    renderLive(chartData, questionId, updateInterval = 5000) {
        const html = renderChart(chartData, questionId);

        // Add live update functionality
        setTimeout(() => {
            this.refreshChart(questionId);
        }, updateInterval);

        return html;
    }

    createPeerOverlay(peerData) {
        return `
            <div class="peer-overlay">
                <h4>Peer Responses</h4>
                <div class="peer-stats">${JSON.stringify(peerData)}</div>
            </div>
        `;
    }

    refreshChart(questionId) {
        // Implementation for live updates
        console.log(`Refreshing chart ${questionId}`);
    }
}