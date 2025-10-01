// preprocessinghtml.jsx - VERSION SOLO HTMLHint (Simplified)

import { HTMLHint } from 'htmlhint';
import { levenshteinEditDistance } from "levenshtein-edit-distance";

// HTMLHint rules configuration
const htmlHintRules = {
  'tagname-lowercase': true,          // Tags in lowercase
  'attr-lowercase': true,             // Attributes in lowercase  
  'attr-value-double-quotes': true,   // Double quotes for attributes
  'doctype-first': false,             // Don't require DOCTYPE (for exercises)
  'tag-pair': true,                   // Tags must be paired
  'spec-char-escape': true,           // Special characters escaped
  'id-unique': true,                  // Unique IDs
  'src-not-empty': true,              // src not empty
  'attr-no-duplication': true,        // Don't duplicate attributes
  'title-require': false,             // Don't require title (for exercises)
  'tag-self-close': false,            // Don't auto-close tags (HTML5 style)
  'space-tab-mixed-disabled': false,  // Consistency in spaces/tabs
};

/**
 * Removes line number references from HTMLHint error messages
 * @param {string} originalMessage - The original HTMLHint error message
 * @returns {string} Message without line number references
 */
const removeLineReferences = (originalMessage) => {
  // Remove "on line X" and similar patterns
  return originalMessage.replace(/\s+on line \d+\..*$/i, '').trim();
};

/**
 * Expert-based severity classification for HTMLHint rules
 * Based on W3C standards, web accessibility guidelines, and industry best practices
 * @param {string} ruleId - The HTMLHint rule ID
 * @returns {string|null} Override severity or null to use original
 */
const getSeverityOverride = (ruleId) => {
  // ERRORS: Issues that break functionality, accessibility, or cause parsing problems
  const errorRules = [
    'tag-pair',              // Unclosed tags break document structure
    'id-unique',             // Duplicate IDs break JavaScript/CSS selectors and accessibility
    'src-not-empty',         // Empty src causes broken images and poor UX
    'attr-no-duplication',   // Duplicate attributes cause unpredictable behavior
    'spec-char-escape',      // Unescaped chars can break HTML parsing
    'doctype-first',         // Missing DOCTYPE affects browser rendering mode
    'title-require'          // Missing title severely impacts SEO and accessibility
  ];

  // WARNINGS: Style/convention issues that don't break functionality but violate best practices
  const warningRules = [
    'tagname-lowercase',     // HTML5 spec recommends lowercase, but browsers are forgiving
    'attr-lowercase',        // Style convention, doesn't break functionality
    'attr-value-double-quotes', // Style preference, single quotes also work
    'tag-self-close',        // XHTML vs HTML5 style difference
    'space-tab-mixed-disabled' // Code formatting preference
  ];

  if (errorRules.includes(ruleId)) {
    return 'error';
  } else if (warningRules.includes(ruleId)) {
    return 'warning';
  }
  
  // Default to original HTMLHint classification for unknown rules
  return null;
};

export const stringToHTML = (text) => {
  console.log(text);
  text = text.replace(/ +/g, " "); // Convert multiple spaces to single space

  let codeLines = [];
  let i = 0;
  let current = "";
  let tagStarted = false;

  // Skip any leading space
  while (i < text.length && text[i].trim() === "") {
    i++;
  }

  text += " ";

  while (i < text.length) {
    // Until first < or >
    while (i < text.length && text[i] !== "<" && text[i] !== ">") {
      if (tagStarted && text[i] === " ") {
        text = text.slice(0, i) + ">" + text.slice(i);
        console.log("in this case", current);
        break;
      }
      current += text[i];
      i++;
    }

    if (tagStarted && text[i] === "<") {
      text = text.slice(0, i) + ">" + text.slice(i);
      console.log("in this case 2", current);
      continue;
    } else if (!tagStarted && text[i] === "<") {
      if (current !== " " && current !== "") {
        codeLines.push([current, "text"]);
      }
      current = "<";
      tagStarted = true;
      i++;
    } else if (text[i] === ">") {
      // Case of text>
      if (current[0] !== "<") {
        current = current.split(" ");
        if (current.length > 1) {
          while (
            current[current.length - 1] ===
            Array(current[current.length - 1].length + 1).join(" ")
          ) {
            current.pop();
          }
          for (let j = 0; j < current.length - 1; j++) {
            codeLines.push([current[j], "text"]);
          }
          current = "<" + current[current.length - 1];
        }
      }
      current += ">";
      tagStarted = false;
      current = current.replace(/ /g, "");

      // SIMPLIFIED: Just add the tag without validation here
      console.log(`Adding tag: "${current}"`);
      codeLines.push([current.toLowerCase(), "tag"]);
      current = "";
      i++;
    }
  }

  console.log("Final codeLines:", codeLines);
  return codeLines;
};

// MAIN FUNCTION: Validate complete HTML with HTMLHint only
export const validateHTMLWithHTMLHint = (htmlContent) => {
  try {
    // Create a complete HTML string that preserves line structure
    let htmlString = '';
    let lineIndexMap = []; // Maps each line in htmlString to original line index
    
    if (Array.isArray(htmlContent)) {
      htmlContent.forEach((line, index) => {
        const lineContent = Array.isArray(line) ? line[0] : line;
        if (lineContent && lineContent.trim()) {
          // Track which original line this htmlString line corresponds to
          lineIndexMap.push(index);
          htmlString += lineContent + '\n';
        }
      });
    } else {
      htmlString = htmlContent;
    }



    // Run HTMLHint
    const messages = HTMLHint.verify(htmlString, htmlHintRules);
    

    
    // Process errors and map them to correct lines - SIMPLIFIED
    const errorsMap = new Map();
    
    messages.forEach(msg => {
      console.log(`HTMLHint error at line ${msg.line}, col ${msg.col}: ${msg.message}`);
      
      // Convert HTMLHint line number (1-based) to our line index (0-based)
      let targetLineIndex = 0;
      
      if (msg.line <= lineIndexMap.length) {
        targetLineIndex = lineIndexMap[msg.line - 1]; // Convert to 0-based index
      }
      

      
      if (!errorsMap.has(targetLineIndex)) {
        errorsMap.set(targetLineIndex, []);
      }
      
      errorsMap.get(targetLineIndex).push({
        message: removeLineReferences(msg.message),
        rule: msg.rule.id,
        severity: getSeverityOverride(msg.rule.id) || msg.type || 'warning'
      });
    });



    return {
      isValid: messages.length === 0,
      errors: errorsMap,
      totalErrors: messages.length,
      messages: messages
    };
  } catch (error) {
    console.error('HTMLHint validation error:', error);
    return {
      isValid: false,
      errors: new Map(),
      totalErrors: 0,
      messages: []
    };
  }
};

// SIMPLIFIED: Main validation function using only HTMLHint
export const validateHTML = (HTMLCode, preserveUserContent = false) => {
  
  // Convert the code to a simple format that only stores content and type
  const result = HTMLCode.map(line => {
    const content = Array.isArray(line) ? line[0] : line;
    
    // Determine if it's a tag or text
    if (content && content.trim().startsWith('<') && content.trim().endsWith('>')) {
      return [content, "tag"];
    } else {
      return [content, "text"];
    }
  });

  // Run HTMLHint validation
  const htmlHintResult = validateHTMLWithHTMLHint(result);

  // Add HTMLHint information to results
  result.htmlHintValidation = htmlHintResult;

  console.log("Final result:", result);
  return result;
};