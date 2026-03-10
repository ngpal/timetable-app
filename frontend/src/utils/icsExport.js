export const exportToICS = (timetableData, filename = 'timetable.ics') => {
    let slotsList = [];
    
    // Attempt to extract slots
    if (Array.isArray(timetableData)) {
        slotsList = timetableData;
    } else if (timetableData && (timetableData.slots || timetableData.timetableSlots)) {
        slotsList = timetableData.slots || timetableData.timetableSlots;
    } else if (typeof timetableData === 'object' && timetableData !== null) {
        // Handle object mapping faculty IDs to timetable data
        Object.values(timetableData).forEach(facultyData => {
            if (facultyData && facultyData.slots) slotsList.push(...facultyData.slots);
            if (facultyData && facultyData.timetableSlots) slotsList.push(...facultyData.timetableSlots);
        });
    }
    
    if (!slotsList || slotsList.length === 0) {
        alert("No timetable data found to export.");
        return;
    }

    const timeSlots = [
        { number: 1, start: '08:00', end: '09:00' },
        { number: 2, start: '09:00', end: '10:00' },
        { number: 3, start: '10:00', end: '11:00' },
        { number: 4, start: '11:00', end: '12:00' },
        { number: 5, start: '12:00', end: '13:00' }, // Lunch
        { number: 6, start: '13:00', end: '14:00' },
        { number: 7, start: '14:00', end: '15:00' },
        { number: 8, start: '15:00', end: '16:00' },
        { number: 9, start: '16:00', end: '17:00' }
    ];

    const dayMap = {
        'Monday': { offset: 1, byday: 'MO' },
        'Tuesday': { offset: 2, byday: 'TU' },
        'Wednesday': { offset: 3, byday: 'WE' },
        'Thursday': { offset: 4, byday: 'TH' },
        'Friday': { offset: 5, byday: 'FR' },
        'Saturday': { offset: 6, byday: 'SA' },
        'Sunday': { offset: 0, byday: 'SU' }
    };

    const today = new Date();
    // Default base date: Find the most recent Sunday
    const baseSunday = new Date(today);
    baseSunday.setHours(0, 0, 0, 0);
    baseSunday.setDate(today.getDate() - today.getDay());

    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Amrita Timetable//EN\r\n";

    slotsList.forEach(slot => {
        if (slot.isSpanContinuation) return;
        if (!slot.day || !slot.slotNumber) return;

        const dayInfo = dayMap[slot.day];
        if (!dayInfo) return;

        const timeSlot = timeSlots.find(t => t.number === slot.slotNumber);
        if (!timeSlot) return;

        const eventDate = new Date(baseSunday);
        eventDate.setDate(baseSunday.getDate() + dayInfo.offset);
        if (eventDate < today) {
            // Push to the next week if it's already past this week
            eventDate.setDate(eventDate.getDate() + 7);
        }

        const [startHours, startMins] = timeSlot.start.split(':');
        const [endHours, endMins] = timeSlot.end.split(':');

        const formatICSDate = (date, hours, mins) => {
            const d = new Date(date);
            d.setHours(parseInt(hours, 10), parseInt(mins, 10), 0);
            return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        let endH = endHours;
        let endM = endMins;

        if (slot.spanSlots > 1) {
            const endSlot = timeSlots.find(t => t.number === slot.slotNumber + slot.spanSlots - 1);
            if (endSlot) {
                const [eh, em] = endSlot.end.split(':');
                endH = eh;
                endM = em;
            }
        }

        const dtStart = formatICSDate(eventDate, startHours, startMins);
        const dtEnd = formatICSDate(eventDate, endH, endM); // assume same day

        const summaryCode = slot.courseCode || slot.subject || 'Class';
        const summaryType = (slot.sessionType && slot.sessionType !== 'Theory') ? ` (${slot.sessionType})` : '';
        const summary = `${summaryCode}${summaryType}`;

        const descLines = [];
        if (slot.courseCode || slot.subject) descLines.push(`Course: ${slot.courseCode || slot.subject}`);
        if (slot.facultyName || slot.faculty) descLines.push(`Faculty: ${slot.facultyName || slot.faculty}`);
        if (slot.department || slot.section) descLines.push(`Class: ${slot.department || ''}-${slot.section || ''}`);
        const description = descLines.join('\\n');
        
        const location = slot.venue || slot.roomNumber || '';

        icsContent += `BEGIN:VEVENT\r\n`;
        icsContent += `UID:${Math.random().toString(36).substr(2, 9)}@amrita.edu\r\n`;
        icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
        icsContent += `DTSTART:${dtStart}\r\n`;
        icsContent += `DTEND:${dtEnd}\r\n`;
        // Recur weekly until end of semester (arbitrarily 20 weeks for now)
        icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayInfo.byday};COUNT=20\r\n`;
        icsContent += `SUMMARY:${summary}\r\n`;
        if (description) icsContent += `DESCRIPTION:${description}\r\n`;
        if (location) icsContent += `LOCATION:${location}\r\n`;
        icsContent += `END:VEVENT\r\n`;
    });

    icsContent += "END:VCALENDAR\r\n";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
