/**
 * 本地测试 addon 是否正常
 * 运行: node test.js
 */
const addon = require('.')

console.log('add(1, 2) =', addon.add(1, 2))
console.log('hello("World") =', addon.hello('World'))
