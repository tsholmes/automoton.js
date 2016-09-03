'use strict';

const HashSet = require('./hashSet');
const transitionComparator = require('./transitionComparator');

let nextId = 0;

function State() {
  this.accept = false;
  this.number = 0;
  
  this.resetTransitions();
  
  this.id = nextId++;
}

State.prototype.resetTransitions = function() {
  this.transitions = new HashSet();
};

State.prototype.addTransition = function(t) {
  this.transitions.add(t);
};

State.prototype.step = function(c) {
  let res = null;
  this.transitions.forEach((t) => {
    if (t.min <= c && c <= t.max) {
      res = t.to;
      return false;
    }
    return true;
  });
  return res;
};

State.prototype.addEpsilon = function(to) {
  if (to.accept) {
    this.accept = true;
  }
  to.transitions.forEach((t) => {
    this.addTransition(t);
  }, this);
};

State.prototype.getSortedTransitions = function(toFirst) {
  let e = this.transitions.toArray();
  e = e.sort(transitionComparator(toFirst));
  return e;
};

// TODO: toString?

// TODO: do we need this?
State.prototype.compareTo = function(s) {
  return s.id - this.id;
};

// TODO: need equals? ===
State.prototype.equals = function(s) {
  return this === s;
};

// TODO: probably don't need hashCode?
State.prototype.hashCode = function() {
  // TODO: this should be unique enough?
  return this.id;
};

module.exports = State;
