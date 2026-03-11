import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export a DOM element as a landscape A4 PDF.
 * 
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} filename - Output filename (without .pdf extension is fine)
 * @returns {Promise<void>}
 */
export const exportToPDF = async (element, filename = 'timetable') => {
    if (!element) {
        alert('Nothing to export. Please wait for the timetable to load.');
        return;
    }

    // Temporarily adjust styles for clean capture
    const originalOverflow = element.style.overflow;
    const originalWidth = element.style.width;
    element.style.overflow = 'visible';
    element.style.width = 'max-content';

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Landscape A4: 297mm x 210mm
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 8;
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;

        // Scale to fit width, then check if it overflows height
        const ratio = usableWidth / imgWidth;
        let finalWidth = usableWidth;
        let finalHeight = imgHeight * ratio;

        // If too tall for one page, scale to fit height instead
        if (finalHeight > usableHeight) {
            const heightRatio = usableHeight / imgHeight;
            finalHeight = usableHeight;
            finalWidth = imgWidth * heightRatio;
        }

        // Center on page
        const xOffset = margin + (usableWidth - finalWidth) / 2;
        const yOffset = margin + (usableHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

        // Clean filename
        const cleanName = filename.replace(/\.pdf$/i, '');
        pdf.save(`${cleanName}.pdf`);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        // Restore original styles
        element.style.overflow = originalOverflow;
        element.style.width = originalWidth;
    }
};
