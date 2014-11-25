var tape = require('tape')
var mview = require('../')

function setEqual(a, b) {
  var matches = 0
  if (a.length !== b.length)
    return false
  for (var i = 0; i < a.length; i++) {
    if (b.indexOf(a[i]) === -1)
      return false
  }
  return true
}

tape('1 add', function (t) {
  var set = mview.set()

  set.add(0, 'Hello World')
  t.assert(setEqual(set.toObject(), ['Hello World']))
  console.log(set.dump())

  t.end()
})

tape('many adds', function (t) {
  var set = mview.set()

  set.add(0, 'Hello World')
  set.add(3, 'Foobar')
  set.add(2, 'Foobaz')
  set.add(6, 'Hello World')
  t.assert(setEqual(set.toObject(), ['Hello World', 'Foobar', 'Foobaz']))
  console.log(set.dump())

  t.end()
})

tape('1 add, 1 remove', function (t) {
  var set = mview.set()

  set.add(0, 'Hello World')
  set.remove(0, 'Hello World')
  t.assert(setEqual(set.toObject(), []))
  console.log(set.dump())

  t.end()
})

tape('many adds, many removes', function (t) {
  var set = mview.set()

  set.add(0, 'Hello World')
  set.add(3, 'Foobar')
  set.add(2, 'Foobaz')
  set.add(6, 'Hello World')
  t.assert(setEqual(set.toObject(), ['Hello World', 'Foobar', 'Foobaz']))
  console.log(set.dump())

  set.remove(3, 'Foobar')
  t.assert(setEqual(set.toObject(), ['Hello World', 'Foobaz']))
  console.log(set.dump())

  set.remove([0, 6], 'Hello World')
  t.assert(setEqual(set.toObject(), ['Foobaz']))
  console.log(set.dump())

  set.add(10, 'Foobaz')
  set.remove(2, 'Foobaz')
  t.assert(setEqual(set.toObject(), ['Foobaz']))
  console.log(set.dump())

  set.remove(10, 'Foobaz')
  t.assert(setEqual(set.toObject(), []))
  console.log(set.dump())

  t.end()
})

tape('add after remove', function (t) {
  var set = mview.set()

  set.remove(0, 'Hello World')
  set.add(0, 'Hello World')
  t.assert(setEqual(set.toObject(), []))
  console.log(set.dump())

  t.end()
})

tape('NO TOMBSTONES 1 add, 1 remove', function (t) {
  var set = mview.set({ noTombstones: true })

  set.add(0, 'Hello World')
  set.remove(0, 'Hello World')
  t.assert(setEqual(set.toObject(), []))
  console.log(set.dump())

  t.end()
})

tape('NO TOMBSTONES many adds, many removes', function (t) {
  var set = mview.set({ noTombstones: true })

  set.add(0, 'Hello World')
  set.add(3, 'Foobar')
  set.add(2, 'Foobaz')
  set.add(6, 'Hello World')
  t.assert(setEqual(set.toObject(), ['Hello World', 'Foobar', 'Foobaz']))
  console.log(set.dump())

  set.remove(3, 'Foobar')
  t.assert(setEqual(set.toObject(), ['Hello World', 'Foobaz']))
  console.log(set.dump())

  set.remove([0, 6], 'Hello World')
  t.assert(setEqual(set.toObject(), ['Foobaz']))
  console.log(set.dump())

  set.add(10, 'Foobaz')
  set.remove(2, 'Foobaz')
  t.assert(setEqual(set.toObject(), ['Foobaz']))
  console.log(set.dump())

  set.remove(10, 'Foobaz')
  t.assert(setEqual(set.toObject(), []))
  console.log(set.dump())

  t.end()
})

tape('NO TOMBSTONES failed add after remove', function (t) {
  var set = mview.set({ noTombstones: true })

  set.remove(0, 'Hello World')
  set.add(0, 'Hello World')
  t.assert(setEqual(set.toObject(), ['Hello World'])) // expected failure due to lack of tombstones
  console.log(set.dump())

  t.end()
})
