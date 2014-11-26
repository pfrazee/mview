# MView - Materialized Views Library

MView is a utility library for distributed databases. It accepts data from the network messages and, using [Causally-Consistenct Ops-based CRDTs](http://gsd.di.uminho.pt/members/cbm/ps/crdtOpsMiddleware.pdf), produces data structures which are consistent across all nodes.

MView does not store its output or generate its messages. It is purely a [view materialization](https://en.wikipedia.org/wiki/Materialized_view) library. All of its data is kept in memory.


## API overview

```js
var mview = require('mview')

var reg = mview.register()
var set = mview.set()
var list = mview.list()
var text = mview.text() // not gonna try to spec this one yet; this will take some thought

// feed operations
// - called while consuming messages to produce the view

reg.set(previousTags, tag, value)

set.add(tag, value)
set.remove(tag|tags, value)

list.insert(tag, value)
list.remove(tag)

// read operations
// - called to get the current state

reg.toObject()
reg.tags()

set.toObject()
set.has(value)
set.count()
set.forEach(function(tags, value, index))
set.map(function(tags, value, index))
set.tags(value)

list.toObject()
list.get(index|tag)
list.count()
list.forEach(function(tag, value, index))
list.map(function(tag, value, index))
list.tags(index)
list.between(tagA, tagB, [uid])
// - unlike the register and set, the list helps generates tags using between()
// - register and set must provide their own tags; for secure-scuttlebutt, they will often be the message ids
// - in the list, you may pass the message ids as the 3rd param of between() to give stronger collision resistence
```


## Example usage


```js
var mview = require('mview')
var messenger = require('...') // your custom message-bus

// declare our materializer
var title = mview.register()

// set some default initial values
title.set(null, 0, 'Favorite Bands 2014') // no previous tags, use `0` as the new tag

// message-creator
function setTitle(v) {
  // emit
  var msg = messenger.broadcast({
    type: 'set-title'
    value: v,
    prevTags: title.tags()
  })
  // handle locally
  onMessage(msg)
}

// message-handler
function onMessage(msg) {
  if (msg.type == 'set-title') {
    title.set(msg.prevTags, msg.id, ''+msg.value)
    render()
  }
}
messenger.on('incoming-msg', onMessage)

// renderer
function render() {
  document.getElementById('title').textContent = title.toObject()
}
```
