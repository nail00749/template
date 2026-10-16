'use strict';

// This fixed ceiling cannot be disabled by caller options.
const MAX_DEPTH = 128;

const assertDepth = depth => {
  if (depth > MAX_DEPTH) {
    throw new SyntaxError(`Brace pattern nesting exceeds maximum depth (${MAX_DEPTH})`);
  }
};

// Only follow child nodes: upstream AST parent/prev links point backwards.
// Validate before entering any recursive walker, including direct lib imports.
const validateAst = ast => {
  const pending = [{ node: ast, depth: 0 }];
  while (pending.length > 0) {
    const { node, depth } = pending.pop();
    if (node.nodes) {
      assertDepth(depth);
      for (const child of node.nodes) {
        pending.push({ node: child, depth: depth + 1 });
      }
    }
  }
};

module.exports = { MAX_DEPTH, assertDepth, validateAst };
