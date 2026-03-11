import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export a DOM element as a landscape A4 PDF with crisp, solid colors.
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

    // Save original styles we'll modify
    const originalOverflow = element.style.overflow;
    const originalWidth = element.style.width;
    const originalBg = element.style.backgroundColor;

    // Force solid white background and full visibility
    element.style.overflow = 'visible';
    element.style.width = 'max-content';
    element.style.backgroundColor = '#ffffff';

    // Force all child elements to full opacity and solid backgrounds
    const allChildren = element.querySelectorAll('*');
    const savedStyles = [];
    allChildren.forEach((child, i) => {
        const computed = window.getComputedStyle(child);
        savedStyles[i] = {
            opacity: child.style.opacity,
            backgroundColor: child.style.backgroundColor
        };
        // Force full opacity
        if (parseFloat(computed.opacity) < 1) {
            child.style.opacity = '1';
        }
        // Convert any rgba backgrounds with alpha to solid rgb
        const bg = computed.backgroundColor;
        if (bg && bg.startsWith('rgba')) {
            const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
            if (match && match[4] && parseFloat(match[4]) < 1) {
                // Blend with white background
                const alpha = parseFloat(match[4]);
                const r = Math.round(parseInt(match[1]) * alpha + 255 * (1 - alpha));
                const g = Math.round(parseInt(match[2]) * alpha + 255 * (1 - alpha));
                const b = Math.round(parseInt(match[3]) * alpha + 255 * (1 - alpha));
                child.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
        }
    });

    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            imageTimeout: 0,
            removeContainer: true
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
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
        // Restore all original styles
        element.style.overflow = originalOverflow;
        element.style.width = originalWidth;
        element.style.backgroundColor = originalBg;
        allChildren.forEach((child, i) => {
            if (savedStyles[i]) {
                child.style.opacity = savedStyles[i].opacity;
                child.style.backgroundColor = savedStyles[i].backgroundColor;
            }
        });
    }
};
