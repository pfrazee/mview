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

tape('NO TOMBSTONES simple branching sequence of values', function (t) {
  var reg = mview.register({ noTombstones: true })

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

tape('NO TOMBSTONES failed add after remove', function (t) {
  var reg = mview.register({ noTombstones: true })

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
  t.equal(reg.toObject(), 'B')
  console.log(reg.dump())
  // NOTE: this result is actually incorrect, as expected
  // tombstones are required if causal message-order is not guaranteed by the application
  // this test demonstrates that failure

  t.end()
})

function sim(numNodes) {
  var updates = []
  var regs = []
  for (var i = 0; i < numNodes; i++)
    regs.push(mview.register())

  var curTag = 0
  function makeTag() { return ++curTag }
  function pickReg() {
    return regs[(Math.random()*numNodes)|0] || reg[0]
  }

  // iterate A-Z
  for (var i='A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
    var reg = pickReg()
    var update = [reg.tags(), makeTag(), String.fromCharCode(i)]

    // apply the update to the chosen register, then store for the others to run later
    reg.set.apply(reg, update)
    updates.push(update)
  }

  // run all updates on all registers
  updates.forEach(function(update) {
    regs.forEach(function(reg) {
      reg.set.apply(reg, update)
    })
  })

  return regs
}

tape('network sim: 2-16 nodes', function(t) {
  for (var numNodes = 2; numNodes <= 16; numNodes++) {
    var regs = sim(numNodes)

    console.log(regs[0].toObject())
    for (var j=1; j < numNodes; j++) {
      t.equal(regs[0].toObject(), regs[j].toObject())
      console.log(regs[j].toObject())
    }

    var tags = regs[0].tags()
    for (var j=1; j < numNodes; j++) {
      regs[j].set(tags, 1000, 'final')
      t.equal(regs[j].toObject(), 'final')
    }
  }

  t.end()
})