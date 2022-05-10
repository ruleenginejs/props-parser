const PROP_TYPE = Object.freeze({
  string: 'string',
  boolean: 'boolean'
});
const PROP_TYPES = Object.values(PROP_TYPE);
const NOT_EMPTY = val => !!val;

const PROP_ANNOTATION = /^\s*@prop\s*\(/i;
const CLOSE_BRACKET = /\)\s*$/;
const COMMENT_LINE = /\s*\/\/(.*)/g;
const PROP_CONTENT = /^prop\s*\((.*)\)\s*$/i;
const STRING_CONTENT = /^'(.*)'$|^"(.*)"$/;
const ARRAY_CONTENT = /^\[(.*)\]$/;
const BOOLEAN = /^(true|false)$/;
const TRUE = 'true';
const FALSE = 'false';
const OPEN_SQUARE_BRACKET = '[';
const CLOSE_SQUARE_BRACKET = ']';

function parseCommentLines(input) {
  const result = [];
  for (let matches of input.matchAll(COMMENT_LINE)) {
    const [, comment] = matches;
    if (
      comment &&
      PROP_ANNOTATION.test(comment) &&
      CLOSE_BRACKET.test(comment)
    ) {
      result.push(comment.trim().slice(1));
    }
  }
  return result;
}

function parseString(input) {
  if (!input) return input;
  const matches = input.match(STRING_CONTENT);
  return matches ? matches[1] || matches[2] : null;
}

function parseStringArray(input) {
  if (!input) return input;
  const matches = input.match(ARRAY_CONTENT);
  if (!matches || !matches[1]) return null;
  return matches[1]
    .split(',')
    .map(s => parseString(s.trim()))
    .filter(NOT_EMPTY);
}

function parseBoolean(input) {
  if (!input) return input;
  const matches = input.match(BOOLEAN);
  if (!matches) return null;
  if (matches[1] === TRUE) return true;
  if (matches[1] === FALSE) return false;
  return null;
}

function parseAnnotation(input) {
  const content = input.match(PROP_CONTENT);
  if (!content || !content[1]) {
    return null;
  }

  const args = content[1]
    .split(',')
    .map(s => s.trim())
    .filter(NOT_EMPTY);

  const propName = parseString(args[0]);
  if (!propName) {
    return null;
  }

  const result = {};
  result.prop = propName;

  const propType = parseString(args[1]);
  if (propType && PROP_TYPES.includes(propType)) {
    result.type = propType;
  } else {
    result.type = PROP_TYPE.string;
  }

  if (args[2] && args[2].startsWith(OPEN_SQUARE_BRACKET)) {
    const lastIndex = args.findIndex(val => val.endsWith(CLOSE_SQUARE_BRACKET));
    if (lastIndex !== -1) {
      args[2] = args.slice(2, lastIndex + 1).join(',');
      args[3] = args[lastIndex + 1];
    }
  }

  let enumOrDefault = parseStringArray(args[2]);
  let isEnum = Array.isArray(enumOrDefault);
  if (isEnum) {
    result.enum = enumOrDefault;
  }

  enumOrDefault = !isEnum ? parseBoolean(args[2]) : null;
  if (typeof enumOrDefault === 'boolean') {
    result.default = enumOrDefault;
  } else {
    enumOrDefault = parseString(args[2]);
    if (enumOrDefault) {
      result.default = enumOrDefault;
    }
  }

  if (isEnum) {
    const enumDefault = parseString(args[3]);
    if (enumDefault) {
      result.default = enumDefault;
    }
  }

  return result;
}

function parse(input) {
  if (typeof input !== 'string') {
    throw new Error('input must be a string');
  }
  return parseCommentLines(input).map(parseAnnotation).filter(NOT_EMPTY);
}

module.exports = parse;
