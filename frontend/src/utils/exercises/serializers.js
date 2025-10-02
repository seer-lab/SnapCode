    // Local exercise -> Firestore doc
export function toFirestoreExercise(local) {
  const rawCode = (local.rawCode || []).map(item =>
    Array.isArray(item)
      ? { content: item[0], type: item[1] || 'text' }
      : typeof item === 'string' ? { content: item, type: 'text' } : item
  );

  const processedHTML = (local.processedHTML || []).map(line =>
    Array.isArray(line)
      ? { content: line[0], type: line[1] || 'text' }
      : typeof line === 'string' ? { content: line, type: 'text' } : line
  );

  let htmlHintValidation = null;
  const v = local.htmlHintValidation;
  if (v) {
    const errors = v.errors instanceof Map ? Object.fromEntries(v.errors) : (v.errors || {});
    htmlHintValidation = {
      isValid: !!v.isValid,
      totalErrors: v.totalErrors || 0,
      messages: v.messages || [],
      errors
    };
  }

  return {
    id: local.id,
    rawCode,
    processedHTML,
    htmlHintValidation,
    finalHTMLOutput: !!local.finalHTMLOutput,
    criticalErrors: local.criticalErrors || 0,
    manuallyCompleted: !!local.manuallyCompleted,
    hasCode: !!local.hasCode,
  };
}

// Firestore doc -> Local exercise
export function fromFirestoreExercise(docData) {
  const d = { ...docData };

  if (d.lastUpdated?.toDate) d.lastUpdated = d.lastUpdated.toDate().toISOString();
  if (d.syncedAt?.toDate) d.syncedAt = d.syncedAt.toDate().toISOString();

  if (Array.isArray(d.rawCode)) {
    d.rawCode = d.rawCode.map(item =>
      item && typeof item === 'object' && 'content' in item
        ? [item.content, item.type || 'text']
        : item
    );
  }

  if (Array.isArray(d.processedHTML)) {
    d.processedHTML = d.processedHTML.map(line =>
      line && typeof line === 'object' && 'content' in line
        ? [line.content, line.type || 'text']
        : line
    );
  }

  return d;
}
