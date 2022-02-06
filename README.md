# @ruleenginejs/props-parser

## Installation

```bash
npm install @ruleenginejs/props-parser
```

## Usage

### handler.js

```js
// @prop('foo', 'string')
// @prop('foo', 'string', '1')
// @prop('bar', 'string', ['a', 'b', 'c'], 'b')
// @prop('baz', 'boolean', true)
export default (context, next) => {
  next();
}
```

### app.js

```js
const propsParser = require('@ruleenginejs/props-parser');
const fs = require('fs');

const contents = fs.readFileSync('handler.js', 'utf8');
console.log(propsParser.parse(contents));

/*
[
  {
    type: 'string',
    prop: 'foo'
  },
  {
    type: 'string',
    prop: 'foo',
    default: '1'
  },
  {
    type: 'string',
    prop: 'bar',
    default: 'b',
    enum: ['a', 'b', 'c']
  },
  {
    type: 'boolean',
    prop: 'baz',
    default: true
  }
]
*/
```

## License

Licensed under the [MIT License](./LICENSE).
