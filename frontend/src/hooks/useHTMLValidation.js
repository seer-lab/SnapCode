import { useState, useCallback } from 'react';
import { validateHTML, stringToHTML } from '../utils/preprocessinghtml.jsx';

export const useHTMLValidation = () => {
  const [validationCache] = useState(new Map());

  // Generate cache key from code content
  const getCacheKey = useCallback((code) => {
    if (!code) return null;
    const content = Array.isArray(code) ? code.map(line => Array.isArray(line) ? line[0] : line).join('') : code;
    return btoa(content); // Simple hash alternative
  }, []);

  // Validate HTML with caching
  const validateCode = useCallback((code, preserveContent = false) => {
    if (!code || (Array.isArray(code) && code.length === 0)) {
      return {
        processedHTML: [],
        validation: null,
        criticalErrors: 0,
        totalErrors: 0,
        canGenerateOutput: true
      };
    }

    const cacheKey = getCacheKey(code);
    if (cacheKey && validationCache.has(cacheKey)) {
      return validationCache.get(cacheKey);
    }

    // Process the code
    let processedHTML;
    if (preserveContent) {
      processedHTML = validateHTML(code, true);
    } else {
      const codeString = Array.isArray(code) ? code.join('') : code;
      processedHTML = validateHTML(stringToHTML(codeString), false);
    }

    // Extract validation results
    const validation = processedHTML.htmlHintValidation || null;
    let criticalErrors = 0;
    let totalErrors = 0;

    if (validation) {
      totalErrors = validation.totalErrors;
      if (validation.errors) {
        const allErrors = Array.from(validation.errors.values()).flat();
        criticalErrors = allErrors.filter(error => error.severity === 'error').length;
      }
    }

    const result = {
      processedHTML,
      validation: validation ? {
        isValid: validation.isValid,
        totalErrors: validation.totalErrors,
        messages: validation.messages,
        // Convert Map to plain object for serialization
        errors: validation.errors instanceof Map 
          ? Object.fromEntries(validation.errors)
          : validation.errors
      } : null,
      criticalErrors,
      totalErrors,
      canGenerateOutput: criticalErrors === 0
    };

    // Cache the result
    if (cacheKey) {
      validationCache.set(cacheKey, result);
      // Limit cache size
      if (validationCache.size > 50) {
        const firstKey = validationCache.keys().next().value;
        validationCache.delete(firstKey);
      }
    }

    return result;
  }, [getCacheKey, validationCache]);

  // Clear cache when needed
  const clearCache = useCallback(() => {
    validationCache.clear();
  }, [validationCache]);

  return {
    validateCode,
    clearCache
  };
};