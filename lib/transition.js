'use strict';

const utils = require('./utils');

function Transition(min, max, to) {
  if (arguments.length === 2) {
    to = max;
    max = min;
  }
  // these fields are stored as char codes
  min = utils.toCharCode(min);
  max = utils.toCharCode(max);
  
  this.min = min;
  this.max = max;
  this.to = to;
}

// TODO: do we need this?
Transition.prototype.equals = function(t) {
  if (!(t instanceof Transition)) {
    return false;
  }
  return t.min === this.min && t.max === this.max && t.to === this.to;
};

// TODO: we don't need hashCode right?
Transition.prototype.hashCode = function() {
  return this.min * 2 + this.max * 3;
};

Transition.prototype.clone = function() {
  return new Transition(this.min, this.max, this.to);
};

// TODO: we probably don't need toString?

module.exports = Transition;
