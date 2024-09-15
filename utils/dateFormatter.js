export function formatDate(datetime) {
    // Check if datetime is not already a Date object
    const date = datetime instanceof Date ? datetime : new Date(datetime);

    // Check if the conversion to a Date object is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
}