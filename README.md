# MView - Materialized Views Library

MView is a utility library for distributed databases. It accepts data from the network messages and, using [Causally-Consistenct Ops-based CRDTs](http://gsd.di.uminho.pt/members/cbm/ps/crdtOpsMiddleware.pdf), produces data structures which are consistent across all nodes.

MView does not store its output or generate its messages. It is purely a [view materialization](https://en.wikipedia.org/wiki/Materialized_view) library. All of its data is kept in memory.


## API overview

```js
var mview = require('mview')

var reg = mview.register()
var set = mview.set()
var list = mview.list()
var tree = mview.tree()
var text = mview.text() // not gonna try to spec this one yet; this will take some thought

// feed operations
// - called while consuming messages to produce the view

reg.set(previousTags, tag, value)

set.add(tag, value)
set.remove(tag|tags, value)

list.insert(priorTag, tag, value)
list.remove(tag, value)

tree.insert(parentTag, tag, value)
tree.remove(tag, value)

// read operations
// - called to get the current state

reg.tags()
reg.toString()

set.has(value)
set.tags(value)
set.count()
set.forEach(function(tags, value, index))
set.map(function(tags, value, index))
set.toObject()

list.get(index)
list.tags(index)
list.count()
list.forEach(function(tag, value, index))
list.map(function(tag, value, index))
list.toObject()

tree.children(parentTag) //=> array of {tag:, value:}
tree.count(parentTag) //=> number
tree.forEach(parentTag, function(tag, value))
tree.map(parentTag, function(tag, value))
tree.toObject()
// - tree has one root node, `null`, from which all nodes descend
```


## Example usage


```js
var mlib = require('ssb-msgs')
var mview = require('mview')

// link to the dataset that this is about
var datasetLink = {
  $rel: 'updates-dataset',
  $msg: 'x65TrpqYr+sCMw0fsk/2XKdhipZcdHrRnxJASxL+sSM=.base64'
}

// declare our materializers
var title = mview.register()
var bandLikes = {}
var comments = mview.tree()

// set some default initial values
title.set('Favorite Bands 2014', 0) // use `0` as the tag

// the message processor
function sync(cb) {
  pull(
    feed.messagesLinkedToMessage(datasetLink.$msg, datasetLink.$rel),
    pull.map(process, cb)
  )
}
function process(msg) {
  var content = msg.content
  if (content.type == 'like') {
    var bandname = content.name
    var tag = [msg.author, msg.id]
    // ^ including author in tag will keep users from deleting each others' tags
    //   (because author can not be forged)

    // track unique likes per author
    // - the like-sets track unique authors, and so will count() to 1 per author 
    if (!bandLikes[bandname])
      bandLikes[bandname] = mview.set()
    bandLikes[bandname].add(tag, msg.author)
  }
  if (content.type == 'unlike') {
    var bandname = content.name
    var removes = mlib.findLinks(content, 'removes')

    // remove likes
    var tags = removes.map(function(link) { return [msg.author, link.$msg] })
    bandLikes[bandname].remove(tags, msg.author)
  }
  if (content.type == 'comment') {
    var text = content.text
    var parent = mlib.findLink(content, 'replies-to')

    // add comment
    // - no parent will add to the root (null) node
    comments.insert(parent?parent.$msg:null, msg.id, { text: text, author: msg.author })
  }
  if (content.type == 'set-title') {
    var title = content.title
    var prevs = mlib.findLinks(content, 'overwrites')

    // update title
    var tags = prevs.map(function(link) { return link.$msg })
    title.set(title, msg.id, tags)
  }
}

// the message generators
function setTitle(str) {
  feed.add({
    dataset: datasetLink,
    type: 'set-title',
    title: str,
    overwrites: title.tags().map(function(id) {
      return { $msg: id, $rel: 'overwrites' }
    })
  })
}
function likeBand(bandname) {
  feed.add({
    dataset: datasetLink,
    type: 'like',
    name: bandname
  })  
}
function unlikeBand(bandname) {
  feed.add({
    dataset: datasetLink,
    type: 'unlike',
    name: bandname,
    removes: bandLikes[bandname]
      .tags(feed.id) // get tags for this users' likes
      .map(function(tag) {
        var msgid = tag[1]
        return { $rel: 'removes', $msg: msgid }
      })
  })  
}
function addComment(text, parent) {
  var content = {
    dataset: datasetLink,
    type: 'comment',
    text: text
  }
  if (parent)
    content.repliesTo = { $rel: 'replies-to', $msg: parent }
  feed.add(content)
}

// the view renderer
function render() {
  renderHeader(title.toString())

  for (name in bandLikes) {
    var likes = bandLikes[name].count()
    renderBand(name, likes)
  }

  renderComments(null) // render comments starting at the root (null) node
  function renderComments(parentId) {
    comments.forEach(parentId, function(childId, text) {
      renderComment(parentId, childId, text) // render this
      renderComments(childId) // render children
    })
  }
}
```