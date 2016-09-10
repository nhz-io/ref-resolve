<h1 align="center">@nhz.io/ref-resolve</h1>

<p align="center">
  <a href="https://npmjs.org/package/@nhz.io/ref-resolve">
    <img src="https://img.shields.io/npm/v/@nhz.io/ref-resolve.svg?style=flat"
         alt="NPM Version">
  </a>

  <a href="https://www.bithound.io/github/nhz-io/ref-resolve">
    <img src="https://www.bithound.io/github/nhz-io/ref-resolve/badges/score.svg"
         alt="Bithound Status">
  </a>

  <a href="https://github.com/nhz-io/ref-resolve/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/nhz-io/ref-resolve.svg?style=flat"
         alt="License">
  </a>

  <a href="https://npmjs.org/package/@nhz.io/ref-resolve">
  <img src="http://img.shields.io/npm/dm/@nhz.io/ref-resolve.svg?style=flat"
  alt="Downloads">
  </a>  
</p>

<h3 align="center">JSON references resolver<h2>

## Install
```
npm i -S @nhz.io/ref-resolve
```

## Example

### Successful reference resolution
```javascript
const resolve = require('@nhz.io/ref-resolve')
const result = resolve({
    a: {foo: 'FOO', bar: 'BAR'},
    b: {foo: '${a.foo}', bar: '${a.bar}'},
    c: '${a.foo}${b.bar}',
})
/* result = {
    a: { foo: 'FOO', bar: 'BAR' },
    b: { foo: 'FOO', bar: 'BAR' },
    c: 'FOOBAR',
} */
```

### Get unresolved references
```javascript
const resolve = require('@nhz.io/ref-resolve')
const unresolved = []
const result = resolve({
    a: {foo: 'FOO', bar: 'BAR'},
    b: {foo: '${a.FOO}', bar: '${a.BAR}'},
    c: '${a.FOO}${a.BAR}'
}, unresolved)
/* result = {
    a: { foo: 'FOO', bar: 'BAR' },
    b: {},
} */

/* unresolved = ['${a.FOO}', '${a.BAR}'] */

```

## License

### [MIT](LICENSE)
