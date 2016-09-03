'use strict';

function compareToFirst(t1, t2) {
  // if toFirst
  if (t1.to !== t2.to) {
    if (t1.to === null) {
      return -1;
    } else if (t2.to === null) {
      return 1;
    } else if (t1.to.number < t2.to.number) {
      return -1;
    } else if (t1.to.number > t2.to.number) {
      return 1;
    }
  }

  if (t1.min < t2.min) {
    return -1;
  }
  if (t1.min > t2.min) {
    return 1;
  }
  if (t1.max > t2.max) {
    return -1;
  }
  if (t1.max < t2.max) {
    return 1;
  }
  return 0;
}

function compareToLast(t1, t2) {
  if (t1.min < t2.min) {
    return -1;
  }
  if (t1.min > t2.min) {
    return 1;
  }
  if (t1.max > t2.max) {
    return -1;
  }
  if (t1.max < t2.max) {
    return 1;
  }
  // if !toFirst
  if (t1.to !== t2.to) {
    if (t1.to === null) {
      return 1;
    } else if (t2.to === null) {
      return 1;
    } else if (t1.to.number < t2.to.number) {
      return -1;
    } else if (t1.to.number > t2.to.number) {
      return 1;
    }
  }
  return 0;
}

function transitionComparator(toFirst) {
  return toFirst ? compareToFirst : compareToLast;
}

module.exports = transitionComparator;
