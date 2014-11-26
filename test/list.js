var tape = require('tape')
var mview = require('../')

function listEqual(a, b) {
  var matches = 0
  if (a.length !== b.length)
    return false
  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i])
      return false
  }
  return true
}

tape('1 insert', function (t) {
  var list = mview.list()

  list.insert(list.between(null, null), 'Hello World')
  t.assert(listEqual(list.toObject(), ['Hello World']))
  console.log(list.dump())

  t.end()
})

tape('many inserts', function (t) {
  var list = mview.list()

  list.insert(list.between(null, null), 'A')
  list.insert(list.between(list.tags(0), null), 'D')
  list.insert(list.between(list.tags(0), list.tags(1)), 'B')
  list.insert(list.between(list.tags(1), list.tags(2)), 'C')
  t.assert(listEqual(list.toObject(), ['A', 'B', 'C', 'D']))
  console.log(list.dump())

  t.end()
})

tape('1 insert, 1 remove', function (t) {
  var list = mview.list()

  list.insert(list.between(null, null), 'Hello World')
  list.remove(list.tags(0))
  t.assert(listEqual(list.toObject(), []))
  console.log(list.dump())

  t.end()
})

tape('many inserts, many removes', function (t) {
  var list = mview.list()

  list.insert(list.between(null, null), 'A')
  list.insert(list.between(list.tags(0), null), 'D')
  list.insert(list.between(list.tags(0), list.tags(1)), 'B')
  list.insert(list.between(list.tags(1), list.tags(2)), 'C')
  t.assert(listEqual(list.toObject(), ['A', 'B', 'C', 'D']))
  console.log(list.dump())

  list.remove(list.tags(2))
  t.assert(listEqual(list.toObject(), ['A', 'B', 'D']))
  console.log(list.dump())

  list.remove(list.tags(0))
  list.insert(list.between(list.tags(0), list.tags(1)), 'E')
  t.assert(listEqual(list.toObject(), ['B', 'E', 'D']))
  console.log(list.dump())

  list.insert(list.between(list.tags(1), list.tags(2)), 'E')
  list.remove(list.tags(3))
  t.assert(listEqual(list.toObject(), ['B', 'E', 'E']))
  console.log(list.dump())

  list.remove(list.tags(0))
  list.remove(list.tags(0))
  list.remove(list.tags(0))
  t.assert(listEqual(list.toObject(), []))
  console.log(list.dump())

  t.end()
})

tape('insert after remove', function (t) {
  var list = mview.list()

  var tag = list.between(null, null)
  list.remove(tag)
  list.insert(tag, 'Hello World')  
  t.assert(listEqual(list.toObject(), []))
  console.log(list.dump())

  t.end()
})

tape('NO TOMBSTONES 1 insert, 1 remove', function (t) {
  var list = mview.list({ noTombstones: true })

  list.insert(list.between(null, null), 'Hello World')
  list.remove(list.tags(0))
  t.assert(listEqual(list.toObject(), []))
  console.log(list.dump())

  t.end()
})

tape('NO TOMBSTONES many inserts, many removes', function (t) {
  var list = mview.list({ noTombstones: true })

  list.insert(list.between(null, null), 'A')
  list.insert(list.between(list.tags(0), null), 'D')
  list.insert(list.between(list.tags(0), list.tags(1)), 'B')
  list.insert(list.between(list.tags(1), list.tags(2)), 'C')
  t.assert(listEqual(list.toObject(), ['A', 'B', 'C', 'D']))
  console.log(list.dump())

  list.remove(list.tags(2))
  t.assert(listEqual(list.toObject(), ['A', 'B', 'D']))
  console.log(list.dump())

  list.remove(list.tags(0))
  list.insert(list.between(list.tags(0), list.tags(1)), 'E')
  t.assert(listEqual(list.toObject(), ['B', 'E', 'D']))
  console.log(list.dump())

  list.insert(list.between(list.tags(1), list.tags(2)), 'E')
  list.remove(list.tags(3))
  t.assert(listEqual(list.toObject(), ['B', 'E', 'E']))
  console.log(list.dump())

  list.remove(list.tags(0))
  list.remove(list.tags(0))
  list.remove(list.tags(0))
  t.assert(listEqual(list.toObject(), []))
  console.log(list.dump())

  t.end()
})

tape('NO TOMBSTONES failed insert after remove', function (t) {
  var list = mview.list({ noTombstones: true })

  var tag = list.between(null, null)
  list.remove(tag)
  list.insert(tag, 'Hello World')  
  t.assert(listEqual(list.toObject(), ['Hello World'])) // expected failure due to lack of tombstones
  console.log(list.dump())

  t.end()
})