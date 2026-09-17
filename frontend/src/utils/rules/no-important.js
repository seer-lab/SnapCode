import * as csstree from 'css-tree';

/**
 * Rule: no-important
 * Detects the use of !important.
 */

export function noImportant(ast) {
  const issues = [];

  csstree.walk(ast, (node) => {
    if (node.type === 'Declaration' && node.important) {
      issues.push({
        rule: 'no-important',
        severity: 'warning',
        message: `Avoid using !important on property "${node.property}"`,
        line: node.loc ? node.loc.start.line : null,
      });
    }
  });

  return issues;
}