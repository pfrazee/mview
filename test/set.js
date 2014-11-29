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

function sim(numNodes) {
  var updates = []
  var sets = []
  for (var i = 0; i < numNodes; i++)
    sets.push(mview.set())

  var curTag = 0
  function makeTag() { return ++curTag }
  function apply(set, update) {
    if (update[0] == 'add')
      set.add.apply(set, update.slice(1))
    if (update[0] == 'remove')
      set.remove.apply(set, update.slice(1))
  }
  function pickSet() {
    return sets[(Math.random()*numNodes)|0] || sets[0]
  }

  // iterate A-Z
  for (var i='A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
    // apply to three sets
    for (var j=0; j < 3; j++) {
      var set = pickSet()
      var update = ['add', makeTag(), String.fromCharCode(i)]

      // apply the update to the chosen set, then store for the others to run later
      apply(set, update)
      updates.push(update)
    }
  }

  // iterate A-Z
  for (var i='A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
    var set = pickSet()
    var c = String.fromCharCode(i)
    var tags = set.tags(c)
    if (tags.length === 0)
      continue // set doesnt have the given value, skip it
    var update = ['remove', set.tags(c), c]

    // apply the update to the chosen set, then store for the others to run later
    apply(set, update)
    updates.push(update)
  }

  // run all updates on all registers
  updates.forEach(function(update) {
    sets.forEach(function(set) {
      apply(set, update)
    })
  })  

  return sets
}

tape('network sim: 2-16 nodes', function(t) {
  for (var numNodes = 2; numNodes <= 16; numNodes++) {
    var sets = sim(numNodes)

    console.log(sets[0].toObject().length)
    for (var j=1; j < numNodes; j++) {
      console.log(sets[j].toObject().length)
      t.assert(setEqual(sets[0].toObject(), sets[j].toObject()))
    }

    var tags = sets[0].tags('A')
    for (var i=0; i < numNodes; i++) {
      sets[i].remove(tags, 'A')
      t.equal(sets[i].has('A'), false)
    }
  }

  t.end()
})