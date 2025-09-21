 /**
   * DO NOT MODIFY - GOLDEN CODE
   * Render attachments (charts, tables, images)
   * Extracted from index.html lines 45341-45392
   */
import { renderChart } from '../charts/renderChart.js';
import { renderTable } from '../tables/renderTable.js';

 function renderAttachments(attachments, questionId) {
    let html = '';
    
    // Handle charts
    if (attachments.chartType) {
        html += renderChart(attachments, questionId);
    }
    
    // Handle tables
    if (attachments.table) {
        html += renderTable(attachments.table);
    }
    
    // Handle images
    if (attachments.image) {
        html += `
            <div class="image-container">
                <img src="${attachments.image}" alt="Question image" style="max-width: 100%; height: auto;">
            </div>
        `;
    }
    
    return html;
}
export { renderAttachments };