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

function sim(numNodes) {
  var updates = []
  var lists = []
  for (var i = 0; i < numNodes; i++)
    lists.push(mview.list())

  var curTag = 0
  function makeTag() { return ++curTag }
  function apply(list, update) {
    if (update[0] == 'insert')
      list.insert.apply(list, update.slice(1))
    if (update[0] == 'remove')
      list.remove.apply(list, update.slice(1))
  }
  function pickIndex(n) {
    return (Math.random()*n)|0
  }
  function pickList() {
    return lists[pickIndex(numNodes)] || lists[0]
  }

  // iterate A-Z
  for (var i='A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
    // apply to three lists
    for (var j=0; j < 3; j++) {
      var list = pickList()
      var index = pickIndex(list.count())
      var update = ['insert', list.between(list.tags(index), list.tags(index+1), makeTag()), String.fromCharCode(i)]

      // apply the update to the chosen list, then store for the others to run later
      apply(list, update)
      updates.push(update)
    }
  }

  // iterate 15 times
  for (var i=0; i < 15; i++) {
    var list = pickList()
    var index = pickIndex(list.count())
    var update = ['remove', list.tags(index)]

    // apply the update to the chosen list, then store for the others to run later
    apply(list, update)
    updates.push(update)
  }

  // run all updates on all registers
  updates.forEach(function(update) {
    lists.forEach(function(list) {
      apply(list, update)
    })
  })  

  return lists
}

tape('network sim: 2-16 nodes', function(t) {
  for (var numNodes = 2; numNodes <= 16; numNodes++) {
    var lists = sim(numNodes)

    console.log(lists[0].count())
    for (var j=1; j < numNodes; j++) {
      console.log(lists[j].count())
      t.assert(listEqual(lists[0].toObject(), lists[j].toObject()))
    }
  }

  t.end()
})