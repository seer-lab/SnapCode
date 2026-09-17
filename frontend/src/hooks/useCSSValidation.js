import { useState, useCallback } from "react";
import { validateCSS } from '../utils/preprocessingCSS.jsx'

export const useCSSValidation = () => {
  const [validationCache] = useState(new Map());

  // Generate cache key from code content 
  const getCacheKey = useCallback((code) => {
    if (!code) return null;
    const content = Array.isArray(code) ? code.map(line => Array.isArray(line) ? line[0] : line).join('') : code;
    return btoa(content);
  }, []);

  /**
   * 
   */

  const stringToCSS = useCallback((cssString) => {
    return cssString.split('\n').map(line => [line, 'text']);
  }, []);

  // Validate CSS with caching
  const validateCode = useCallback((code) => {
    if (!code || (Array.isArray(code) && code.length === 0)) {
      return {
        processedCSS: [],
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

    const cssLine = Array.isArray(code) ? code : stringToCSS(code);
    const processedCSS = validateCSS(cssLine);

    // Extract validation results 
    const validation = processedCSS.cssValidation || null;
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
      processedCSS,
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
  }, [getCacheKey, validationCache, stringToCSS]);

  // Clear cache when needed
  const clearCache = useCallback(() => {
    validationCache.clear();
  }, [validationCache]);

  return {
    validateCode,
    clearCache
  };
};