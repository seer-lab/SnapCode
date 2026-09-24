/**
 * Defines the why of the line editing
 * 
 * @param {Array} errorsBeforeChange - result of getAllErrorsFrom(),
 * each item with { message, severity, rule, line }
 * @param {number} lineIndex - the line is editing/added/deleted
 * @returns {'error' | 'warning' | 'modification'}
 */

export const getEditReason = (errorsBeforeChange, lineIndex) => {
    if (!Array.isArray(errorsBeforeChange)) return 'modification';

    const errorsOnThisLine = errorsBeforeChange.filter((err) => err.line === lineIndex);

    if (errorsOnThisLine.some((err) => err.severity === 'error')) {
        return 'error';
    }
    if (errorsOnThisLine.some((err) => err.severity === 'warning')) {
        return 'warning';
    }
    return 'modification';
};
