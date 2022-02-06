// @prop('foo', 'string')
// @prop('foo', 'string', '1')
// @prop('bar', 'string', ['a', 'b', 'c'], 'b')
// @prop('baz', 'boolean', true)
export default (context, next) => {
  next();
}
