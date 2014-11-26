var between = require('between')

module.exports = function(opts) {
  opts = opts||{}
  var list = {}

  // currently active keys, in order
  var tags = []
  // values attached to each tag
  // - a map of tag->value
  var values = {}
  // tags which have been removed
  var tombstones = {}

  list.dump = function() {
    return {
      opts: opts,
      tags: tags,
      values: values,
      tombstones: tombstones
    }
  }

  list.load = function(dump) {
    opts = dump.opts
    tags = dump.tags
    values = dump.values
    tombstones = dump.tombstones
  }

  list.toObject = function() {
    return tags.map(function(tag) { return values[tag] })
  }

  list.get = function(tag) {
    if (typeof tag == 'Number') {
      return values[tags[tag]]
    }
    return values[tag]
  }

  list.count = function() {
    return tags.length
  }

  list.forEach = function(cb) {
    tags.forEach(function(tag, index) {
      cb(tag, values[tag], index)
    })
  }

  list.map = function(cb) {
    return tags.map(function(tag, index) {
      return cb(tag, values[tag], index)
    })
  }

  list.tags = function(index) {
    return tags[index]
  }

  function fuzz () {
    return Math.random().toString().substring(2, 8)
  }
  list.between = function(tagA, tagB, uid) {
    uid = uid || fuzz()
    return between(tagA || between.lo, tagB || between.hi) + uid
  }

  list.insert = function(tag, value) {
    // check if the new value is already tombstoned
    if (tombstones[tag])
      return

    // add to our tracking
    values[tag] = value
    tags.push(tag)
    tags.sort()
  }

  list.remove = function(tag) {
    var i = tags.indexOf(tag)
    if (i !== -1)
      tags.splice(i, 1)
    delete values[tag]
    if (!opts.noTombstones)
      tombstones[tag] = 1
  }

  return list
}