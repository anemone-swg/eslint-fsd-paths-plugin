"use strict";
const path = require("path");

const layers = {
  entities: "entities",
  features: "features",
  widgets: "widgets",
  pages: "pages",
};

const excludedLayers = ["shared", "app"];

function isPathRelative(p) {
  return p === "." || p.startsWith("./") || p.startsWith("../");
}

function shouldBeRelative(from, to) {
  if (isPathRelative(to)) return false;

  const ALIAS = "@/";
  const cleanTo = to.startsWith(ALIAS) ? to.slice(ALIAS.length) : to;
  const toArray = cleanTo.split("/");
  const toLayer = toArray[0];
  const toSlice = toArray[1];

  if (!toLayer || !toSlice || !layers[toLayer]) return false;

  if (excludedLayers.includes(toLayer)) return false;

  const normalizedFrom = path.normalize(from);
  const projectFrom = normalizedFrom.split(`src${path.sep}`)[1];
  if (!projectFrom) return false;

  const fromArray = projectFrom.split(path.sep);
  const fromLayer = fromArray[0];
  const fromSlice = fromArray[1];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) return false;
  if (excludedLayers.includes(fromLayer)) return false;

  return fromLayer === toLayer && fromSlice === toSlice;
}


/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
          "A plugin for checking relative paths within a single slice (except app, shared)",
    },
    messages: {
      shouldBeRelative:
          "В рамках одного слайса все пути должны быть относительными",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importTo = node.source.value;
        const fromFileName =
            context.getPhysicalFilename?.() || context.filename || "";

        if (shouldBeRelative(fromFileName, importTo)) {
          context.report({
            node,
            messageId: "shouldBeRelative",
          });
        }
      },
    };
  },
};
