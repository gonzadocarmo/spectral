import { importSpecifier, identifier } from '../ast/builders.mjs';

const withKeys = identifier('withKeys');

var withKeysImportSpecifier = importSpecifier(withKeys, withKeys);

export default withKeysImportSpecifier;
