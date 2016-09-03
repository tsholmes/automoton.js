'use strict';

const Character = require('./character');
const HashSet = require('./hashSet');
const MinimizationOperations = require('./minimizationOperations');
const State = require('./state');
const Transition = require('./transition');

function Automoton() {
  // TODO: need info?
  this.cachedHash = 0;
  this.initial = new State();
  this.deterministic = true;
  this.singleton = null;
}

Automoton.MINIMIZE_HUFFMAN = 0;
Automoton.MINIMIZE_BRZOZOWSKI = 1;
Automoton.MINIMIZE_HOPCROFT = 2;
Automoton.minimization = Automoton.MINIMIZE_HOPCROFT;
Automoton.minimizeAlways = false;
Automoton.allowMutation = false;
Automoton.isDebug = null; // TODO: need this?

Automoton.prototype.checkMinimizeAlways = function() {
  if (Automoton.minimizeAlways) {
    this.minimize();
  }
};

Automoton.prototype.isSingleton = function() {
  return this.singleton !== null;
};

Automoton.prototype.setInitialState = function(s) {
  this.initial = s;
  this.singleton = null;
};

Automoton.prototype.getInitialState = function() {
  this.expandSingleton();
  return this.inital;
};

Automoton.prototype.getStates = function() {
  this.expandSingleton();
  const visited = new HashSet(); // TODO: HashSet<State> equivalent?
  const workList = []; // TODO: LinkedList<State>
  workList.push(this.initial);
  visited.add(this.initial);
  while (workList.length > 0) {
    const s = workList.shift(); // TODO: inefficient
    s.transitions.forEach((t) => {
      if (!visited.contains(t.to)) {
        visited.add(t.to);
        workList.push(t.to);
      }
    });
  }
  return visited;
};

Automoton.prototype.getAcceptStates = function() {
  // TODO: is this more efficient re-implemented?
  const accepts = new HashSet(); // TODO: HashSet<State>
  
  this.states.forEach((s) => {
    if (s.accept) {
      accepts.add(s);
    }
  });
  
  return accepts;
};

Automoton.setStateNumbers = function(states) { // HashSet<State>
  let number = 0;
  states.forEach((s) => {
    s.number = number++;
  });
};

Automoton.prototype.totalize = function() {
  const s = new State();
  s.transitions.add(new Transition(Character.MIN_VALUE, Character.MAX_VALUE, s));
  
  this.getStates.forEach((p) => {
    let maxi = Character.MIN_VALUE;
    for (const t of p.getSortedTransitions(false)) {
      if (t.min > maxi) {
        p.transitions.add(new Transition(maxi, t.min - 1, s));
      }
      if (t.max + 1 > maxi) {
        maxi = t.max + 1;
      }
    }
    if (maxi <= Character.MAX_VALUE) {
      p.transitions.add(new Transition(maxi, Character.MAX_VALUE, s));
    }
  });
};

Automoton.prototype.restoreInvariant = function() {
  this.removeDeadTransitions();
};

Automoton.prototype.reduce = function() {
  if (this.isSingleton()) {
    return;
  }
  const states = this.getStates();
  Automoton.setStateNumbers(states);
  states.forEach((s) => {
    const st = s.getSortedTransitions(true);
    s.resetTransitions();
    let p = null;
    let min = -1, max = -1;
    for (const t of st) {
      if (p === t.to) {
        if (t.min <= max + 1) {
          if (t.max > max) {
            max = t.max;
          }
        } else {
          if (p !== null) {
            s.transitions.add(new Transition(min, max, p));
          }
          min = t.min;
          max = t.max;
        }
      } else {
        if (p !== null) {
          s.transitions.add(new Transition(min, max, p));
        }
        p = t.to;
        min = t.min;
        max = t.max;
      }
    }
    if (p !== null) {
      s.transitions.add(new Transition(min, max, p));
    }
  });
  this.clearHashCode();
};

Automoton.prototype.getStartPoints = function() {
  const pointSet = new HashSet((c) => c, (a, b) => a === b); // TODO: HashSet<Character>
  this.getStates().forEach((s) => {
    pointSet.add(Character.MIN_VALUE);
    s.transitions.forEach((t) => {
      pointSet.add(t.min);
      if (t.max < Character.MAX_VALUE) {
        pointSet.add(t.max + 1);
      }
    });
  });
  return pointSet.toArray().sort();
};

Automoton.prototype.getLiveStates = function(states) { // HashSet<State>
  if (arguments.length === 0) {
    this.expandSingleton();
    states = this.getStates();
  }
  const map = {}; // TODO: HashMap<State, Set<State>>
  states.forEach((s) => {
    map[s.id] = new HashSet();
  });
  states.forEach((s) => {
    s.transitions.forEach((t) => {
      map[t.to.id].add(s);
    });
  });
  const live = this.getAcceptStates();
  const workList = live.toArray(); // TODO: LinkedList<State>
  while (workList.length) {
    const s = workList.shift();
    map[s.id].forEach((p) => {
      if (!live.contains(p)) {
        live.add(p);
        workList.push(p);
      }
    });
  }
  return live;
};

Automoton.prototype.removeDeadTransitiosn = function() {
  // TODO: clearHashCode();
  if (this.isSingleton()) {
    return;
  }
  const states = this.getStates();
  const live = this.getLiveStates(states);
  states.forEach((s) => {
    const st = s.transitions;
    s.resetTransitions();
    st.forEach((t) => {
      if (live.contains(t.to)) {
        s.transitions.add(t);
      }
    });
  });
  this.reduce();
};

Automoton.getSortedTransitions = function(states) { // HashSet<State>
  Automoton.setStateNumbers(states);
  const transitions = Array(states.length);
  states.forEach((s) => {
    transitions[s.number] = s.getSortedTransitions(false);
  });
  return transitions;
};

Automoton.prototype.expandSingleton = function() {
  if (this.isSingleton()) {
    let p = new State();
    this.initial = p;
    for (let i = 0; i < this.singleton.length; i++) {
      const q = new State();
      p.transitions.add(new Transition(this.singleton.charCodeAt(i), q));
      p = q;
    }
    p.accept = true;
    this.deterministic = true;
    this.singleton = null;
  }
};

Automoton.prototype.getNumberOfStates = function() {
  if (this.isSingleton()) {
    return this.singleton.length + 1;
  }
  return this.getStates().length;
};

Automoton.prototype.getNumberOfTransitions = function() {
  if (this.isSingleton()) {
    return this.singleton.length;
  }
  let c = 0;
  this.state.forEach((s) => {
    c += s.transitions.length;
  });
  return c;
};

// TODO: do we need this?
Automoton.prototype.equals = function(a) {
  if (this === a) {
    return true;
  }
  if (!(a instanceof Automoton)) {
    return false;
  }
  if (this.isSingleton() && a.isSingleton()) {
    return this.singleton.equals(a.singleton);
  }
  return this.hashCode() === a.hashCode() && this.subsetOf(a) && a.subsetOf(this);
};

Automoton.prototype.hashCode = function() {
  if (this.cachedHash === 0) {
    this.minimize();
  }
  return this.cachedHash;
};

Automoton.prototype.recomputeHashCode = function() {
  this.cachedHash = this.getNumberOfStates() * 3 + this.getNumberOfTransitions() * 2;
  if (this.cachedHash === 0) {
    this.cachedHash = 1;
  }
};

Automoton.prototype.clearHashCode = function() {
  this.cachedHash = 0;
};

// TODO: need toString?

// TODO: need toDot?

Automoton.prototype.cloneExpanded = function() {
  const a = this.clone();
  a.expandSingleton();
  return a;
};

Automoton.prototype.cloneExpandedIfRequired = function() {
  if (Automoton.allowMutation) {
    this.expandSingleton();
    return this;
  } else {
    return this.cloneExpanded();
  }
};

Automoton.prototype.clone = function() {
  const a = new Automoton();
  a.cachedHash = this.cachedHash;
  a.intial = this.initial;
  a.deterministic = this.deterministic;
  a.singleton = this.singleton;
  if (!this.isSingleton()) {
    const m = {};
    const states = this.getStates();
    states.forEach((s) => {
      m[s.id] = new State();
    });
    states.forEach((s) => {
      const p = m[s.id];
      p.accept = s.accept;
      if (s === this.initial) {
        a.initial = p;
      }
      s.transitions.forEach((t) => {
        p.transitions.add(new Transition(t.min, t.max, m[t.to.id]));
      });
    });
  }
  return a;
};

Automoton.prototype.cloneIfRequired = function() {
  if (Automoton.allowMutation) {
    return this;
  } else {
    return this.clone();
  }
};

// TODO: load/store????

// TODO: *Operations Methods???

Automoton.prototype.minimize = function() {
  MinimizationOperations.minimize(this);
};

Automoton.minimize = function(a) {
  a.minimize();
  return a;
};

// TODO: shuffle(a)

module.exports = Automoton;
