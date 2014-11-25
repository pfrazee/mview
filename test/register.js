var tape = require('tape')
var mview = require('../')

tape('1 value', function (t) {
  var reg = mview.register()

  console.log(null, 0, 'Hello World')
  reg.set(null, 0, 'Hello World')
  t.equal(reg.toObject(), 'Hello World')
  console.log(reg.dump())

  t.end()
})

tape('linear sequence of values', function (t) {
  var reg = mview.register()

  console.log(null, 0, 'A')
  reg.set(null, 0, 'A')
  t.equal(reg.toObject(), 'A')
  console.log(reg.dump())

  console.log(0, 1, 'B')
  reg.set(0, 1, 'B')
  t.equal(reg.toObject(), 'B')
  console.log(reg.dump())

  console.log(1, 2, 'C')
  reg.set(1, 2, 'C')
  t.equal(reg.toObject(), 'C')
  console.log(reg.dump())

  console.log(2, 3, 'D')
  reg.set(2, 3, 'D')
  t.equal(reg.toObject(), 'D')
  console.log(reg.dump())

  console.log(3, 4, 'E')
  reg.set(3, 4, 'E')
  t.equal(reg.toObject(), 'E')
  console.log(reg.dump())

  console.log(4, 5, 'F')
  reg.set(4, 5, 'F')
  t.equal(reg.toObject(), 'F')
  console.log(reg.dump())

  console.log(5, 6, 'G')
  reg.set(5, 6, 'G')
  t.equal(reg.toObject(), 'G')
  console.log(reg.dump())
  t.end()
})

tape('simple branching sequence of values', function (t) {
  var reg = mview.register()

  console.log(null, 0, 'A')
  reg.set(null, 0, 'A')
  t.equal(reg.toObject(), 'A')
  console.log(reg.dump())

  console.log(0, 1, 'B')
  reg.set(0, 1, 'B')
  t.equal(reg.toObject(), 'B')
  console.log(reg.dump())

  console.log(0, 2, 'C')
  reg.set(0, 2, 'C')
  t.equal(reg.toObject(), 'B')
  console.log(reg.dump())

  console.log([1,2], 3, 'D')
  reg.set([1,2], 3, 'D')
  t.equal(reg.toObject(), 'D')
  console.log(reg.dump())
  t.end()
})

tape('complex branching sequence of values', function (t) {
  var reg = mview.register()

  console.log(null, 'a', 'A')
  reg.set(null, 'a', 'A')
  t.equal(reg.toObject(), 'A')
  console.log(reg.dump())

  console.log('a', 'e', 'B')
  reg.set('a', 'e', 'B')
  t.equal(reg.toObject(), 'B')
  console.log(reg.dump())

  console.log('a', 'i', 'C')
  reg.set('a', 'i', 'C')
  t.equal(reg.toObject(), 'B')
  console.log(reg.dump())

  console.log(['a','e'], 'c', 'D')
  reg.set(['a','e'], 'c', 'D')
  t.equal(reg.toObject(), 'D')
  console.log(reg.dump())

  console.log('i', 'f', 'E')
  reg.set('i', 'f', 'E')
  t.equal(reg.toObject(), 'D')
  console.log(reg.dump())

  console.log(['c','i'], 'l', 'F')
  reg.set(['c','i'], 'l', 'F')
  t.equal(reg.toObject(), 'E')
  console.log(reg.dump())

  console.log(['a','e','i'], 'b', 'G')
  reg.set(['a','e','i'], 'b', 'G')
  t.equal(reg.toObject(), 'G')
  console.log(reg.dump())

  console.log(['b','f','l'], 'm', 'H')
  reg.set(['b','f','l'], 'm', 'H')
  t.equal(reg.toObject(), 'H')
  console.log(reg.dump())

  t.end()
})

tape('add after remove', function (t) {
  var reg = mview.register()

  console.log(null, 0, 'A')
  reg.set(null, 0, 'A')
  t.equal(reg.toObject(), 'A')
  console.log(reg.dump())

  console.log([0, 1], 2, 'C')
  reg.set([0, 1], 2, 'C')
  t.equal(reg.toObject(), 'C')
  console.log(reg.dump())

  console.log(0, 1, 'B')
  reg.set(0, 1, 'B')
  t.equal(reg.toObject(), 'C')
  console.log(reg.dump())

  t.end()
})