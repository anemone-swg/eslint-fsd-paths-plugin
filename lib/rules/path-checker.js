/**
 * @fileoverview A training plugin for testing absolute and relative paths across architectures
 * @author Max
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const path = require('path');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "A training plugin for testing absolute and relative paths across architectures",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
    messages: {}, // Add messageId and message
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importTo = node.source.value;

        const fromFileName = context.filename;

        if (shouldBeRelative(fromFileName, importTo)) {
          context.report(node, 'В рамках одного слайса все пути должны быть относительными')
        }
      }
    };
  },
};

const layers = {
  'shared': 'shared',
  'entities': 'entities',
  'features': 'features',
  'widgets': 'widgets',
  'pages': 'pages',
}

function isPathRelative(path) {
  return path === '.' || path.startsWith('../') || path.startsWith('./');
}

function shouldBeRelative(from, to) {
  if (isPathRelative(to)) return false;

  const toArray = to.split('/');
  const toLayer = toArray[0];
  const toSlice = toArray[1];

  if (!toLayer || !toSlice|| !layers[toLayer]) {
    return false;
  }

  const normalizedPath = path.toNamespacedPath(from);
  const projectFrom = normalizedPath.split('src')[1];

  const fromArray = projectFrom.split('\\');
  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice|| !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}
