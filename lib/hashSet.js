'use strict';

const BUCKET_COUNT = 1024;

// TODO: swap this out for something real
function HashSet(hash, eq) {
  this.buckets = {};
  this.length = 0;
  this.hash = hash || ((el) => el.hashCode());
  this.eq = eq || ((el1, el2) => el1.equals(el2));
}

HashSet.prototype.add = function(el) {
  const hash = this.hash(el) % BUCKET_COUNT;
  const node = {
    el: el,
    next: null
  };
  let head = this.buckets[hash];
  if (head) {
    let tail;
    while (head) {
      tail = head;
      if (this.eq(head.el, el)) {
        return false;
      }
      head = head.next;
    } 
    tail.next = node;
    this.length++;
    return true;
  } else {
    this.buckets[hash] = node;
    this.length++;
    return true;
  }
};

HashSet.prototype.contains = function(el) {
  const hash = this.hash(el) % BUCKET_COUNT;
  let head = this.buckets[hash];
  while (head) {
    if (this.eq(head.el, el)) {
      return true;
    }
    head = head.next;
  }
  return false;
};

HashSet.prototype.forEach = function(fn, self) {
  for (const hash in this.buckets) {
    let head = this.buckets[hash];
    while (head) {
      if (fn.call(self, head.el) === false) {
        return;
      }
      head = head.next;
    }
  }
};

HashSet.prototype.toArray = function() {
  const res = [];
  this.forEach((el) => {
    res.push(el);
  });
  return res;
};

module.exports = HashSet;
