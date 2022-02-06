const babelParser = require("@babel/parser");

const NODE_TYPE = Object.freeze({
  commentLine: "CommentLine",
  callExpression: "CallExpression",
  stringLiteral: "StringLiteral",
  arrayExpression: "ArrayExpression",
  booleanLiteral: "BooleanLiteral"
});

const PROP_TYPE = Object.freeze({
  string: "string",
  boolean: "boolean"
});
const PROP_TYPES = Object.values(PROP_TYPE);

const PROP_ANNOTATION = /^\s*@prop\s*\(/i;
const CLOSE_BRACKET = /\)\s*$/;

function parseCommentLines(input, sourceType) {
  const ast = babelParser.parse(input, {
    sourceType,
    attachComment: true
  });

  const commentLines = (ast.comments || [])
    .filter(c => c.type === NODE_TYPE.commentLine
      && PROP_ANNOTATION.test(c.value)
      && CLOSE_BRACKET.test(c.value)
    ).map(c => c.value.trim().slice(1));

  return commentLines;
}

function parseEnum(arrayExpression) {
  if (arrayExpression) {
    return arrayExpression.elements
      .filter(el => el.type === NODE_TYPE.stringLiteral && el.value)
      .map(el => el.value);
  }
  return [];
}

function parseAnnotation(input) {
  const result = {};

  const ast = babelParser.parseExpression(input);
  if (ast.type !== NODE_TYPE.callExpression) {
    return null;
  }

  let [propName, propType, enumOrDefault, defaultValue] = ast.arguments;

  if (!propName
    || propName.type !== NODE_TYPE.stringLiteral
    || !propName.value) {
    return null;
  }

  result.prop = propName.value;

  if (propType
    && propType.type === NODE_TYPE.stringLiteral
    && PROP_TYPES.includes(propType.value)) {
    result.type = propType.value;
  } else {
    result.type = PROP_TYPE.string;
  }

  let isEnum = false;
  if (enumOrDefault) {
    if (enumOrDefault.type === NODE_TYPE.arrayExpression) {
      isEnum = true;
      result.enum = parseEnum(enumOrDefault);
    } else if (enumOrDefault.type === NODE_TYPE.stringLiteral) {
      result.default = enumOrDefault.value;
    } else if (enumOrDefault.type === NODE_TYPE.booleanLiteral) {
      result.default = enumOrDefault.value;
    }
  }

  if (isEnum && defaultValue && defaultValue.type === NODE_TYPE.stringLiteral) {
    result.default = defaultValue.value;
  }

  return result;
}

function parse(input, options = {}) {
  if (typeof input !== "string") {
    throw new Error("input must be a string");
  }

  const sourceType = options.sourceType || "unambiguous";
  const commentLines = parseCommentLines(input, sourceType);
  return commentLines.map(parseAnnotation).filter(r => !!r);
}

module.exports = parse;
