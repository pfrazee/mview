


module.exports = function() {
  var reg = {}

  // currently active values
  // - a map of tag->value
  var values = {}
  // tags which have been removed
  var tombstones = {}
  // currently-winning tag
  var currentTag = null

  reg.dump = function() {
    return {
      values: values,
      tombstones: tombstones
    }
  }

  reg.load = function(dump) {
    values = dump.values
    tombstones = dump.tombstones
    setCurrentTag()
  }

  reg.toObject = function() {
    if (currentTag === null)
      return null
    if (!(currentTag in values))
      throw "Register Internal Failure - lost track of the active value"
    return values[currentTag]
  }

  reg.tags = function() {
    return Object.keys(values)
  }

  reg.set = function(previousTags, tag, value) {
    // tombstone any previous tags
    if (previousTags || previousTags === 0) {
      previousTags = Array.isArray(previousTags) ? previousTags : [previousTags]
      previousTags.forEach(function(pt) {
        delete values[pt]
        tombstones[pt] = 1
      })
    }

    // check if this new value is already tombstoned
    if (tombstones[tag])
      return

    // store value
    values[tag] = value
    setCurrentTag()
  }

  function setCurrentTag() {
    // choose the lowest alpha-sorted tag as the current tag
    var tags = reg.tags()
    if (tags.length > 1)
      tags.sort()
    currentTag = tags[0]
  }

  return reg
}