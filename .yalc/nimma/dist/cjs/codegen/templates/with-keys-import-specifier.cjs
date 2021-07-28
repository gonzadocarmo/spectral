'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');

const withKeys = builders.identifier('withKeys');

var withKeysImportSpecifier = builders.importSpecifier(withKeys, withKeys);

exports.default = withKeysImportSpecifier;
