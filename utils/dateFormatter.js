export function formatDate(datetime) {
    // Check if datetime is not already a Date object
    const date = datetime instanceof Date ? datetime : new Date(datetime);

    // Check if the conversion to a Date object is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });
}

export function formatDateCorto(datetime) {
    // Check if datetime is not already a Date object
    const date = datetime instanceof Date ? datetime : new Date(datetime);

    // Check if the conversion to a Date object is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });
}

export function formatDateRelative(timestamp, locale = 'es') {
    const date = new Date(timestamp);
    const options = {
        recent: { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        thisYear: { month: 'numeric', day: 'numeric' },
        older: { year: 'numeric', month: 'numeric', day: 'numeric' }
    };

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
        return `Hoy a las ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isThisYear) {
        return date.toLocaleDateString(locale, options.thisYear);
    } else {
        return date.toLocaleDateString(locale, options.older);
    }
};