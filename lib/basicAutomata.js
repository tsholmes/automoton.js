'use strict';

const Automaton = require('./automaton');
const Character = require('./character');
const State = require('./state');
const StatePair = require('./statePair');
const StringUnionOperations = require('./stringUnionOperations');
const Transition = require('./transition');
const utils = require('./utils');

const ZERO_CHAR = '0'.charCodeAt(0);

const BasicAutomata = {};

BasicAutomata.makeEmpty = function() {
  const a = new Automaton();
  const s = new State();
  a.initial = s;
  a.deterministic = true;
  return a;
};

BasicAutomata.makeEmptyString = function() {
  const a = new Automaton();
  a.singleton = '';
  a.deterministic = true;
  return a;
};

BasicAutomata.makeAnyString = function() {
  const a = new Automaton();
  const s = new State();
  a.initial = s;
  s.accept = true;
  s.transitions.add(new Transition(Character.MIN_VALUE, Character.MAX_VALUE, s));
  a.deterministic = true;
  return a;
};

BasicAutomata.makeAnyChar = function() {
  return BasicAutomata.makeCharRange(Character.MIN_VALUE, Character.MAX_VALUE);
};

BasicAutomata.makeChar = function(c) {
  c = String.fromCharCode(utils.toCharCode(c));
  const a = new Automaton();
  a.singleton = c;
  a.deterministic = true;
  return a;
};

BasicAutomata.makeCharRange = function(min, max) {
  min = utils.toCharCode(min);
  max = utils.toCharCode(max);
  if (min === max) {
    return BasicAutomata.makeChar(min);
  }
  const a = new Automaton();
  const s1 = new State();
  const s2 = new State();
  a.initial = s1;
  s2.accept = true;
  if (min <= max) {
    s1.transitions.add(new Transition(min, max, s2));
  }
  a.deterministic = true;
  return a;
};

BasicAutomata.makeCharSet = function(set) { /* String */
  if (set.length === 1) {
    return BasicAutomata.makeChar(set);
  }
  const a = new Automaton();
  const s1 = new State();
  const s2 = new State();
  a.initial = s1;
  s2.accept = true;
  for (let i = 0; i < set.length; i++) {
    s1.transitions.add(new Transition(set[i], s2));
  }
  a.deterministic = true;
  a.reduce();
  return a;
};

function anyOfRightLength(x, n) { /* String, int */
  const s = new State();
  if (x.length === n) {
    s.accept = true;
  } else {
    s.addTransition(new Transition('0', '9', anyOfRightLength(x, n + 1)));
  }
  return s;
}

function atLeast(x, n, initials, zeroes) { /* String, int, []State, boolean */
  const s = new State();
  if (x.length === n) {
    s.accept = true;
  } else {
    if (zeroes) {
      initials.push(s);
    }
    const c = x.charCodeAt(n);
    s.addTransition(new Transition(c, atLeast(x, n + 1, initials, zeroes && c === ZERO_CHAR)));
  }
  return s;
}

function atMost(x, n) { /* String, int */
  const s = new State();
  if (x.length === n) {
    s.accept = true;
  } else {
    const c = x.charCodeAt(n);
    s.addTransition(new Transition(c, atMost(x, n + 1)));
    if (c > ZERO_CHAR) {
      s.addTransition(new Transition('0', c - 1, anyOfRightLength(x, n + 1)));
    }
  }
  return s;
}

function between(x, y, n, initials, zeroes) { /* string, string, int, []State, boolean */
  const s = new State();
  if (x.length === n) {
    s.accept = true;
  } else {
    if (zeroes) {
      initials.push(s);
    }
    const cx = x.charCodeAt(n);
    const cy = y.charCodeAt(n);
    if (cx === cy) {
      s.addTransition(new Transition(cx, between(x, y, n + 1, initials, zeroes && cx === ZERO_CHAR)));
    } else {
      s.addTransition(new Transition(cx, atLeast(x, n + 1, initials, zeroes && cx === ZERO_CHAR)));
      s.addTransition(new Transition(cy, atMost(y, n + 1)));
      if (cx + 1 < cy) {
        s.addTransition(new Transition(cx + 1, cy - 1, anyOfRightLength(x, n + 1)));
      }
    }
  }
  return s;
}

BasicAutomata.makeInterval = function(min, max, digits) {
  const a = new Automaton();
  let x = `${min}`;
  let y = `${max}`;
  if (min > max || (digits > 0 && y.length > digits)) {
    throw new Error('Invalid arguments');
  }
  let d;
  if (digits > 0) {
    d = digits;
  } else {
    d = y.length;
  }
  for (let i = x.length; i < d; i++) {
    x = '0' + x;
  }
  for (let i = y.length; i < d; i++) {
    y = '0' + y;
  }
  const initials = []; // ArrayList<State>
  a.initial = between(x, y, 0, initials, digits <= 0);
  if (digits <= 0) {
    const pairs = []; // ArrayList<StatePair>
    initials.forEach((p) => {
      if (a.initial !== p) {
        pairs.push(new StatePair(a.initial, p));
      }
    });
    a.addEpsilons(pairs);
    a.initial.addTransition(new Transition('0', a.initial));
    a.deterministic = false;
  } else {
    a.deterministic = true;
  }
  a.checkMinimizeAlways();
  return a;
};

BasicAutomata.makeString = function(s) {
  const a = new Automaton();
  a.singleton = s;
  a.deterministic = true;
  return a;
};

BasicAutomata.makeStringUnion = function() { /* CharSequence... */
  const strings = Array.from(arguments);
  if (strings.length === 0) {
    return BasicAutomata.makeEmpty();
  }
  strings.sort(); // TODO: is this LEXICOGRAPHIC_ORDER?
  const a = new Automaton();
  a.setInitialState(StringUnionOperations.build(strings));
  a.deterministic = true;
  a.reduce();
  a.recomputeHashCode();
  return a;
};

// TODO: makeMaxInteger (relies on RegExp)

// TODO: makeMinInteger

// TODO: makeTotalDigits

// TODO: makeFractionDigits

// TODO: makeIntegerValue

module.exports = BasicAutomata;
