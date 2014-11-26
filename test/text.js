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
