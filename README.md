# MView - Materialized Views Library

MView is a utility library for distributed databases. It accepts data from the network messages and, using [Causally-Consistenct Ops-based CRDTs](http://gsd.di.uminho.pt/members/cbm/ps/crdtOpsMiddleware.pdf), produces data structures which are consistent across all nodes.

MView does not store its output or generate its messages. It is purely a [view materialization](https://en.wikipedia.org/wiki/Materialized_view) library. All of its data is kept in memory.


## API overview

```js
var mview = require('mview')

// Registers
// =========

// api
var reg = mview.register()
reg.set(previousTags, tag, value)
reg.tags()
reg.toObject()

// usage
function set(v) {
  broadcast({
    overwrites: reg.tags()
    value: v
  })
}
function onmsg(msgid, msg) {
  reg.set(msg.overwrites, msgid, msg.value)
}

// Text Buffers (string)
// =====================

// api
var text = mview.text()
text.update(diff)
text.diff(str)
text.toString()

// usage
function set(v) {
  broadcast({
    diff: text.diff(v)
  })
}
function onmsg(msgid, msg) {
  text.update(msg.diff)
}

// Unordered Sets
// ==============

// api
var set = mview.set()
set.add(tag, value)
set.remove(tag|tags, value)
set.tags(value)
set.toObject()
set.has(value)
set.count()
set.forEach(function(tags, value, index))
set.map(function(tags, value, index))

// usage
function add(v) {
  broadcast({
    type: 'add',
    value: v
  })
}
function remove(v) {
  broadcast({
    type: 'remove',
    value: v,
    tags: set.tags(v)
  })
}
function onmsg(msgid, msg) {
  if (msg.type == 'add')
    set.add(msgid, msg.value)
  if (msg.type == 'remove')
    set.remove(msg.tags, msg.value)
}

// Ordered Lists
// =============

// api
var list = mview.list()
list.insert(tag, value)
list.remove(tag)
list.tags(index)
list.between(tagA, tagB, [uid])
list.toObject()
list.get(index|tag)
list.count()
list.forEach(function(tag, value, index))
list.map(function(tag, value, index))

// usage
function append(v) {
  broadcast({
    type: 'insert',
    tag: list.between(list.tags(list.count() - 1), null)
    value: v
  })
}
function prepend(v) {
  broadcast({
    type: 'insert',
    tag: list.between(null, list.tags(0))
    value: v
  })
}
function insert(i, v) {
  broadcast({
    type: 'insert',
    tag: list.between(list.tags(i-1), list.tags(i))
    value: v
  })
}
function remove(i) {
  broadcast({
    type: 'remove',
    tag: set.tags(i)
  })
}
function onmsg(msgid, msg) {
  if (msg.type == 'insert')
    list.insert(msg.tag, msg.value)
  if (msg.type == 'remove')
    list.remove(msg.tag)
}
```
