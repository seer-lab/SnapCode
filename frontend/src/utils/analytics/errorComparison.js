export const compareErrorStates = (beforeErrors, afterErrors) => {
  const before = beforeErrors || [];
  const after = afterErrors || [];
  
  const resolved = before.filter(beforeError => 
    !after.some(afterError => 
      afterError.line === beforeError.line && 
      afterError.message === beforeError.message &&
      afterError.rule === beforeError.rule
    )
  );
  
  const newErrors = after.filter(afterError => 
    !before.some(beforeError => 
      beforeError.line === afterError.line && 
      beforeError.message === afterError.message &&
      beforeError.rule === beforeError.rule
    )
  );
  
  return { resolved, newErrors };
};

export const getAllErrorsFrom = (errorsObj) => {
  if (!errorsObj) return [];
  const entries = errorsObj instanceof Map
    ? Array.from(errorsObj.entries())
    : Object.entries(errorsObj || {});
  
  const uniqueErrors = new Map();
  
  entries.forEach(([lineIndex, errors]) => {
    (errors || []).forEach(error => {
      const key = `${lineIndex}-${error.message}-${error.rule}`;
      if (!uniqueErrors.has(key)) {
        uniqueErrors.set(key, {
          message: error.message,
          severity: error.severity,
          rule: error.rule,
          line: Number(lineIndex)
        });
      }
    });
  });
  
  return Array.from(uniqueErrors.values());
};