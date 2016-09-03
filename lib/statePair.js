'use strict';

function StatePair(s, s1, s2) {
  if (arguments.length === 2) {
    s2 = s1;
    s1 = s;
    s = null;
  }
  this.s = s;
  this.s1 = s1;
  this.s2 = s2;
}

StatePair.prototype.equals = function(p) {
  if (!(p instanceof StatePair)) {
    return p.s1 === this.s1 && p.s2 === this.s2;
  }
  return false;
};

// TODO: don't need hashCode?

module.exports = StatePair;
