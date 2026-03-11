/**
 * Export the timetable as a PDF using the browser's native print dialog.
 * This gives pixel-perfect rendering — no html2canvas color issues.
 * 
 * Opens a new window with just the timetable content + print styles,
 * then triggers the browser's "Save as PDF" / Print dialog.
 * 
 * @param {HTMLElement} element - The DOM element to print
 * @param {string} title - Title shown in the print header
 */
export const exportToPDF = (element, title = 'Timetable') => {
    if (!element) {
        alert('Nothing to export. Please wait for the timetable to load.');
        return;
    }

    // Open a fresh window
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
        alert('Please allow pop-ups to download the PDF.');
        return;
    }

    // Gather all stylesheets from the current page
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(el => el.outerHTML)
        .join('\n');

    // Clone content and strip buttons
    const clone = element.cloneNode(true);
    clone.querySelectorAll('button').forEach(btn => btn.remove());
    // Remove any input/select controls
    clone.querySelectorAll('select, input[type="text"]').forEach(el => el.remove());

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    ${styles}
    <style>
        /* Force light mode and solid backgrounds for printing */
        :root {
            --bg: #ffffff !important;
            --card-bg: #ffffff !important;
            --surface: #ffffff !important;
            --surface-hover: #f1f5f9 !important;
            --text-main: #1f2937 !important;
            --text-muted: #6b7280 !important;
            --text-light: #9ca3af !important;
            --border: #D1D5DB !important;
            --border-light: #f3f4f6 !important;
            --sidebar-bg: #111827 !important;
            --primary: #2563EB !important;
            --danger: #991b1b !important;
            --warning: #92400e !important;
            --success: #166534 !important;
        }
        
        [data-theme="dark"] {
            --bg: #ffffff !important;
            --card-bg: #ffffff !important;
            --surface: #ffffff !important;
            --text-main: #1f2937 !important;
        }

        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #1f2937 !important;
        }

        body {
            padding: 10px;
        }

        /* Force all elements to full opacity */
        .dashboard-fade-in,
        .dashboard-fade-in * {
            opacity: 1 !important;
            animation: none !important;
            transform: none !important;
        }

        /* Ensure the container fits the page */
        .amrita-timetable-container {
            background-color: #ffffff !important;
            padding: 0.5rem !important;
            min-height: auto !important;
        }

        /* Hide scrollbars */
        .timetable-grid-wrapper {
            overflow: visible !important;
        }

        /* Hide page header (the one with buttons) */
        .page-header {
            display: none !important;
        }

        /* Print-specific styles */
        @media print {
            @page {
                size: landscape A4;
                margin: 10mm;
            }
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    ${clone.outerHTML}
    <script>
        // Auto-trigger print dialog once loaded
        window.onload = function() {
            setTimeout(function() {
                window.print();
                // Close window after print dialog closes  
                window.onafterprint = function() {
                    window.close();
                };
                // Fallback: close after 1 second if onafterprint not supported
                setTimeout(function() { window.close(); }, 1000);
            }, 500);
        };
    </script>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
