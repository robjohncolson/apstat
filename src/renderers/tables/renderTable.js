        /**
         * DO NOT MODIFY - GOLDEN CODE
         * Table rendering function that handles both object and array formats
         * Extracted from index.html lines 45047-45107
         */

        function renderTable(table) {
            if (!table) return '';

            let tableHtml = '<div class="table-container"><table>';

            // Handle object format (with headers and rows properties)
            if (table.headers && table.rows) {
                // Render headers
                tableHtml += '<thead><tr>';
                table.headers.forEach(header => {
                    tableHtml += `<th>${header}</th>`;
                });
                tableHtml += '</tr></thead>';

                // Render rows
                if (table.rows && table.rows.length > 0) {
                    tableHtml += '<tbody>';
                    table.rows.forEach(row => {
                        tableHtml += '<tr>';
                        row.forEach(cell => {
                            tableHtml += `<td>${cell}</td>`;
                        });
                        tableHtml += '</tr>';
                    });
                    tableHtml += '</tbody>';
                }
            }
            // Handle array format (legacy)
            else if (Array.isArray(table) && table.length > 0) {
                const headers = table[0];
                const rows = table.slice(1);

                // Headers
                tableHtml += '<thead><tr>';
                headers.forEach(header => {
                    tableHtml += `<th>${header}</th>`;
                });
                tableHtml += '</tr></thead>';

                // Rows
                if (rows.length > 0) {
                    tableHtml += '<tbody>';
                    rows.forEach(row => {
                        tableHtml += '<tr>';
                        row.forEach(cell => {
                            tableHtml += `<td>${cell}</td>`;
                        });
                        tableHtml += '</tr>';
                    });
                    tableHtml += '</tbody>';
                }
            }

            tableHtml += '</table></div>';

            return tableHtml;
        }

        export { renderTable };