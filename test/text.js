var tape = require('tape')
var mview = require('../')

tape('1 update', function (t) {
  var text = mview.text()

  text.update(text.diff('Hello World'))
  t.equal(text.toString(), 'Hello World')
  console.log(text.dump())

  t.end()
})

tape('linear sequence of updates', function (t) {
  var text = mview.text()

  text.update(text.diff('Hello World'))
  t.equal(text.toString(), 'Hello World')
  console.log(text.dump())

  text.update(text.diff('Hello Brave World'))
  t.equal(text.toString(), 'Hello Brave World')
  console.log(text.dump())

  text.update(text.diff('Oh Brave World'))
  t.equal(text.toString(), 'Oh Brave World')
  console.log(text.dump())

  text.update(text.diff('And now for something completely different'))
  t.equal(text.toString(), 'And now for something completely different')
  console.log(text.dump())

  t.end()
})

tape('concurrent updates', function (t) {
  var text1 = mview.text()
  var text2 = mview.text()

  text1.update(text1.diff('Hello World'))
  t.equal(text1.toString(), 'Hello World')
  text2.load(JSON.parse(JSON.stringify(text1.dump())))
  t.equal(text1.toString(), text2.toString())
  console.log(text1.dump())

  var diffA = text1.diff('Hello Brave World')
  var diffB = text2.diff('Goodbye Cruel World')

  text1.update(diffA)
  t.equal(text1.toString(), 'Hello Brave World')
  text2.update(diffB)
  t.equal(text2.toString(), 'Goodbye Cruel World')

  text1.update(diffB)
  text2.update(diffA)
  t.equal(text1.toString(), 'Goodbye Cruel Brave World')
  t.equal(text1.toString(), text2.toString())
  console.log(text1.dump())
  console.log(text2.dump())

  t.end()
})

function sim(numNodes) {
  var updates = []
  var texts = []
  for (var i = 0; i < numNodes; i++)
    texts.push(mview.text())

  var curTag = 0
  function pickIndex(n) {
    return (Math.random()*n)|0
  }
  function pickText() {
    return texts[pickIndex(numNodes)] || texts[0]
  }

  // iterate A-Z
  for (var i='A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
    // apply to three texts
    for (var j=0; j < 3; j++) {
      var text = pickText()
      var update = text.diff(text.toString() + ' ' + String.fromCharCode(i))

      // apply the update to the chosen text, then store for the others to run later
      text.update(update)
      updates.push(update)
    }
  }

  // run all updates on all texts
  updates.forEach(function(update) {
    texts.forEach(function(text) {
      text.update(update)
    })
  })  

  return texts
}

tape('network sim: 2-16 nodes', function(t) {
  for (var numNodes = 2; numNodes <= 16; numNodes++) {
    var texts = sim(numNodes)

    console.log(texts[0].toString())
    for (var j=1; j < numNodes; j++) {
      console.log(texts[j].toString())
      t.equal(texts[0].toString(), texts[j].toString())
    }
  }

  t.end()
})