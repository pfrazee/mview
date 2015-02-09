var list = require('./list')
var diff = require('adiff').diff

module.exports = function(opts) {
  opts = opts||{}
  var text = {}

  // an ordered list of string chunks
  var chunks = list(opts)

  text.dump = function() {
    return {
      opts: opts,
      chunks: chunks.dump()
    }
  }

  text.load = function(dump) {
    opts = dump.opts
    chunks.load(dump.chunks)
  }

  text.toString = function() {
    return chunks.toObject().join(' ').replace(/\n /g, '\n')
  }

  function split(str) {
    // split on newlines but include newlines in the words
    return str.replace(/\n/g, '\n ').split(/ /g)
  }

  text.diff = function(str) {
    var i, adds = [], dels = []
    diff(chunks.toObject(), split(str)).forEach(function(d) {
      var index = d[0]
      var nDeletes = d[1]
      var newTokens = d.slice(2)

      // delete N chunks
      for (i=0; i < nDeletes; i++)
        dels.push(chunks.tags(index + i))

      // insert new chunks
      var before = chunks.tags(index - 1)
      var after = chunks.tags(index + nDeletes)
      for (i=0; i < newTokens.length; i++) {
        var tag = chunks.between(before, after)
        adds.push([tag, newTokens[i]])
        before = tag
      }
    })
    return {adds: adds, dels: dels}
  }

  text.update = function(diff) {
    ;(diff.adds||[]).forEach(function(add) {
      var tag = add[0]
      var value = add[1]
      chunks.insert(tag, value)
    })
    ;(diff.dels||[]).forEach(function(tag) {
      chunks.remove(tag)
    })
  }

  return text
}