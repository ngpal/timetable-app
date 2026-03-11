import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export a DOM element as a landscape A4 PDF with crisp, solid colors.
 * Clones the element into an isolated offscreen container to avoid
 * inherited transparency, opacity, and CSS variable issues.
 */
export const exportToPDF = async (element, filename = 'timetable') => {
    if (!element) {
        alert('Nothing to export. Please wait for the timetable to load.');
        return;
    }

    // Create an offscreen container with guaranteed solid white background
    const offscreen = document.createElement('div');
    offscreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: ${element.scrollWidth + 40}px;
        background: #ffffff;
        z-index: -9999;
        opacity: 1;
        pointer-events: none;
        padding: 20px;
    `;
    document.body.appendChild(offscreen);

    // Deep clone the element
    const clone = element.cloneNode(true);
    clone.style.overflow = 'visible';
    clone.style.width = 'max-content';
    clone.style.backgroundColor = '#ffffff';
    clone.style.opacity = '1';
    clone.style.transform = 'none';
    clone.style.filter = 'none';
    offscreen.appendChild(clone);

    // Force all elements in clone to solid colors
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
        const computed = window.getComputedStyle(el);
        
        // Force full opacity
        el.style.opacity = '1';
        el.style.filter = 'none';
        
        // Convert rgba backgrounds to solid rgb (blend with white)
        const bg = computed.backgroundColor;
        if (bg && bg.includes('rgba')) {
            const match = bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
            if (match) {
                const a = parseFloat(match[4]);
                if (a < 1) {
                    const r = Math.round(parseInt(match[1]) * a + 255 * (1 - a));
                    const g = Math.round(parseInt(match[2]) * a + 255 * (1 - a));
                    const b = Math.round(parseInt(match[3]) * a + 255 * (1 - a));
                    el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                }
            }
        }

        // Convert rgba text colors to solid
        const color = computed.color;
        if (color && color.includes('rgba')) {
            const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
            if (match) {
                const a = parseFloat(match[4]);
                if (a < 1) {
                    const r = Math.round(parseInt(match[1]) * a + 255 * (1 - a));
                    const g = Math.round(parseInt(match[2]) * a + 255 * (1 - a));
                    const b = Math.round(parseInt(match[3]) * a + 255 * (1 - a));
                    el.style.color = `rgb(${r}, ${g}, ${b})`;
                }
            }
        }

        // Convert rgba border colors to solid
        const borderColor = computed.borderColor;
        if (borderColor && borderColor.includes('rgba')) {
            const match = borderColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
            if (match) {
                const a = parseFloat(match[4]);
                if (a < 1) {
                    const r = Math.round(parseInt(match[1]) * a + 255 * (1 - a));
                    const g = Math.round(parseInt(match[2]) * a + 255 * (1 - a));
                    const b = Math.round(parseInt(match[3]) * a + 255 * (1 - a));
                    el.style.borderColor = `rgb(${r}, ${g}, ${b})`;
                }
            }
        }
    });

    // Remove buttons from clone so they don't appear in the PDF
    clone.querySelectorAll('button').forEach(btn => btn.remove());

    try {
        const canvas = await html2canvas(clone, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: clone.scrollWidth + 40,
            windowHeight: clone.scrollHeight + 40,
            imageTimeout: 0
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

        // Scale to fit width
        const ratio = usableWidth / imgWidth;
        let finalWidth = usableWidth;
        let finalHeight = imgHeight * ratio;

        // If too tall, scale to fit height instead
        if (finalHeight > usableHeight) {
            const heightRatio = usableHeight / imgHeight;
            finalHeight = usableHeight;
            finalWidth = imgWidth * heightRatio;
        }

        // Center on page
        const xOffset = margin + (usableWidth - finalWidth) / 2;
        const yOffset = margin + (usableHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

        const cleanName = filename.replace(/\.pdf$/i, '');
        pdf.save(`${cleanName}.pdf`);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        // Clean up the offscreen container
        document.body.removeChild(offscreen);
    }
};
