import * as csstree from 'css-tree';

/**
 * Rule: no-id-selector
 * Identify the use of selectors by ID (ex. #header),
 */

export function noIdSelector(ast) {
  const issues = [];

  csstree.walk(ast, (node) => {
    if (node.type === 'IdSelector') {
      issues.push({
        rule: 'no-id-selector',
        severity: 'warning',
        message: `Avoid using selectors by ID (#${node.name})`,
        line: node.loc ? node.loc.start.line : null,
      });
    }
  });

  return issues;

}