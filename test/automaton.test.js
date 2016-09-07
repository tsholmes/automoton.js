'use strict';

const assert = require('assert');
const Automaton = require('../lib/automaton');
const State = require('../lib/state');
const Transition = require('../lib/transition');

describe('Automaton', function() {
  let states;
  let automoton;
  
  beforeEach(function() {
    const initial = new State();
    const intermediate = new State();
    const end1 = new State();
    const end2 = new State();
    
    end1.accept = true;
    end2.accept = true;
    
    initial.addTransition(new Transition('a', 'e', intermediate));
    initial.addTransition(new Transition('f', 'j', end1));
    intermediate.addTransition(new Transition('k', 'o', end1));
    intermediate.addTransition(new Transition('p', 't', end2));
    
    states = [ initial, intermediate, end1, end2 ];
    automoton = new Automaton();
    automoton.setInitialState(initial);
  });
  
  describe('getNumberOfStates', function() {
    it('should return the correct number of states', function() {
      assert.strictEqual(automoton.getNumberOfStates(), states.length);
    });
  });
  
  describe('getNumberOfTransitions', function() {
    it('should return the correct number of transitions', function() {
      assert.strictEqual(automoton.getNumberOfTransitions(), 4);
    });
  });
  
  describe('getStates', function() {
    it('should return a set of all states', function() {
      const expected = {};
      states.forEach((s) => {
        expected[s.id] = s.id;
      });
      
      const actual = {};
      automoton.getStates().forEach((s) => {
        actual[s.id] = s.id;
      });
      
      assert.deepEqual(actual, expected);
    });
  });
  
  describe('singleton', function() {
    let automoton;
    
    beforeEach(function() {
      automoton = new Automaton();
      automoton.singleton = 'hello world';
    });
    
    it('should have the right size', function() {
      assert.strictEqual(automoton.getNumberOfStates(), 12);
      assert.strictEqual(automoton.getNumberOfTransitions(), 11);
    });
    
    it('should have the right size after expanding', function() {
      automoton.expandSingleton();
      assert.strictEqual(automoton.getNumberOfStates(), 12);
      assert.strictEqual(automoton.getNumberOfTransitions(), 11);
    });
  });
  
  describe('everything else', function() {
    it('should not throw an error', function() {
      Automaton.minimize(automoton);
      automoton.cloneIfRequired();
      automoton.cloneExpandedIfRequired();
      (new Automaton()).hashCode();
      automoton.equals(new Automaton());
      automoton.clearHashCode();
      automoton.totalize();
      automoton.reduce();
      automoton.removeDeadTransitions();
      automoton.getStartPoints();
      Automaton.getSortedTransitions(automoton.getStates());
      automoton.getInitialState();
      automoton.checkMinimizeAlways();
      
      const singleA = new Automaton();
      singleA.singleton = 'hello';
      const singleB = new Automaton();
      singleB.singleton = 'world';
      singleA.equals(singleB);
      
      Automaton.allowMutation = true;
      automoton.cloneIfRequired();
      automoton.cloneExpandedIfRequired();
      
      Automaton.allowMutation = false;
    });
  });
});
