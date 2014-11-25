module.exports = function(opts) {
  opts = opts||{}
  var set = {}

  // currently active values
  // - a map of value->{tags}
  var values = {}
  // tags which have been removed
  var tombstones = {}

  set.dump = function() {
    return {
      opts: opts,
      values: values,
      tombstones: tombstones
    }
  }

  set.load = function(dump) {
    opts = dump.opts
    values = dump.values
    tombstones = dump.tombstones
  }

  set.toObject = function() {
    return Object.keys(values)
  }

  set.has = function(value) {
    return ((''+value) in values)
  }

  set.count = function() {
    return set.toObject().length
  }

  set.forEach = function(cb) {
    set.toObject().forEach(function(value, index) {
      cb(set.tags(value), value, index)
    })
  }

  set.map = function(cb) {
    return set.toObject().map(function(value, index) {
      return cb(set.tags(value), value, index)
    })
  }

  set.tags = function(value) {
    return Object.keys(values[value] || {})
  }

  set.add = function(tag, value) {
    // check if the new value is already tombstoned
    if (tombstones[tag])
      return

    // store the tag under the value
    value = ''+value
    if (!set.has(value)) {
      values[value] = {}
    }
    values[value][tag] = 1
  }

  set.remove = function(tags, value) {
    tags = Array.isArray(tags) ? tags : [tags]
    var valueTags = values[value] || {}

    // remove the matching tags for the value
    tags.forEach(function(tag) {
      delete valueTags[tag]
      if (!opts.noTombstones)
        tombstones[tag] = 1
    })

    // remove the value if all tags are removed
    if (Object.keys(valueTags).length === 0)
      delete values[value]
  }

  return set
}