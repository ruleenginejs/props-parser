const propsParser = require('..');
const path = require('path');
const fs = require('fs');

const fixtures = path.resolve(__dirname, "fixtures");

describe('props-parser', () => {
  it('string property without default value', () => {
    const input = "// @prop('a', 'string')";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(1);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'a'
    });
  });

  it('string property with default value', () => {
    const input = "// @prop('a', 'string', 'defaultValue')";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(1);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'a',
      default: 'defaultValue'
    });
  });

  it('boolean property without default value', () => {
    const input = "// @prop('a', 'boolean')";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(1);
    expect(actual[0]).toMatchObject({
      type: 'boolean',
      prop: 'a'
    });
  });

  it('boolean property with default value', () => {
    const input = "// @prop('a', 'boolean', true)";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(1);
    expect(actual[0]).toMatchObject({
      type: 'boolean',
      prop: 'a',
      default: true
    });
  });

  it('enum property without default value', () => {
    const input = "// @prop('a', 'string', ['b', 'c', 'd'])";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(1);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'a',
      enum: ['b', 'c', 'd']
    });
  });

  it('enum property with default value', () => {
    const input = "// @prop('a', 'string', ['b', 'c', 'd'], 'c')";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(1);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'a',
      default: 'c',
      enum: ['b', 'c', 'd']
    });
  });

  it('many properties', () => {
    let lines = [];
    lines.push("// @prop('a', 'string', ['b', 'c', 'd'], 'c')");
    lines.push("// @prop('f', 'boolean')");
    lines.push("// @prop('e', 'string', 'z')");
    const actual = propsParser.parse(lines.join("\n"));
    expect(actual.length).toEqual(3);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'a',
      default: 'c',
      enum: ['b', 'c', 'd']
    });
    expect(actual[1]).toMatchObject({
      type: 'boolean',
      prop: 'f'
    });
    expect(actual[2]).toMatchObject({
      type: 'string',
      prop: 'e',
      default: 'z'
    });
  });

  it('read input from file', () => {
    const contents = fs.readFileSync(path.join(fixtures, 'base.js'), 'utf8');
    const actual = propsParser.parse(contents);
    expect(actual.length).toEqual(4);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'foo'
    });
    expect(actual[1]).toMatchObject({
      type: 'string',
      prop: 'foo',
      default: '1'
    });
    expect(actual[2]).toMatchObject({
      type: 'string',
      prop: 'bar',
      default: 'b',
      enum: ['a', 'b', 'c']
    });
    expect(actual[3]).toMatchObject({
      type: 'boolean',
      prop: 'baz',
      default: true
    });
  });

  it('read input from file with es module', () => {
    const contents = fs.readFileSync(path.join(fixtures, 'base.es.js'), 'utf8');
    const actual = propsParser.parse(contents);
    expect(actual.length).toEqual(4);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'foo'
    });
    expect(actual[1]).toMatchObject({
      type: 'string',
      prop: 'foo',
      default: '1'
    });
    expect(actual[2]).toMatchObject({
      type: 'string',
      prop: 'bar',
      default: 'b',
      enum: ['a', 'b', 'c']
    });
    expect(actual[3]).toMatchObject({
      type: 'boolean',
      prop: 'baz',
      default: true
    });
  });

  it('empty input', () => {
    const actual = propsParser.parse('');
    expect(actual.length).toEqual(0);
  });

  it('no args input', () => {
    const input = '// @prop    ()';
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(0);
  });

  it('one argument', () => {
    const input = "// @prop('a')";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(1);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'a'
    });
  });

  it('with spaces', () => {
    const input = "// @prop     ('b')   ";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(1);
    expect(actual[0]).toMatchObject({
      type: 'string',
      prop: 'b'
    });
  });

  it('should return empty array when bad syntax', () => {
    const input = "// @prop('b',   ";
    const actual = propsParser.parse(input);
    expect(actual.length).toEqual(0);
  });

  it('should throw error when input not string', () => {
    expect(() => { propsParser.parse({}) }).toThrowError('input must be a string');
    expect(() => { propsParser.parse(1) }).toThrowError('input must be a string');
    expect(() => { propsParser.parse(false) }).toThrowError('input must be a string');
    expect(() => { propsParser.parse([]) }).toThrowError('input must be a string');
  });
});
