'use strict';

const assert = require('assert');
const HashSet = require('../lib/hashSet');

describe('HashSet', function() {
  let set;

  beforeEach(function() {
    set = new HashSet((c) => c, (a, b) => a === b);
  });

  describe('.add', function() {
    describe('when adding a new element', function() {
      it('should increase the length by 1', function() {
        const origLength = set.length;
        set.add(1);
        assert.strictEqual(set.length, origLength + 1);
      });

      it('should return true', function() {
        assert.strictEqual(set.add(1), true);
      });
    });

    describe('when adding an existing element', function() {
      beforeEach(function() {
        set.add(1);
      });

      it('should not change length', function() {
        const origLength = set.length;
        set.add(1);
        assert.equal(set.length, origLength);
      });

      it('should return false', function() {
        assert.strictEqual(set.add(1), false);
      });
    });
  });

  describe('.contains', function() {
    it('should return true for an existing element', function() {
      set.add(1);
      assert.strictEqual(set.contains(1), true);
    });

    it('should return false for a nonexistent element', function() {
      set.add(1);
      assert.strictEqual(set.contains(2), false);
    });

    it('should return true for an existing element in a large set', function() {
      for (let i = 0; i < 10000; i++) {
        set.add(i);
      }
      assert.strictEqual(set.contains(1234), true);
    });

    it('should return false for an nonexistant element in a large set', function() {
      for (let i = 0; i < 10000; i++) {
        set.add(i);
      }
      assert.strictEqual(set.contains(11234), false);
    });
  });

  describe('.forEach', function() {
    it('should iterate through all elements', function() {
      const expected = {};
      for (let i = 0; i < 10000; i++) {
        set.add(i);
        expected[i] = i;
      }
      const actual = {};
      set.forEach((i) => {
        actual[i] = i;
      });
      assert.deepEqual(actual, expected);
    });

    it('should stop early when the iterator function returns false', function() {
      set.add(1);
      set.add(2);

      let count = 0;
      set.forEach(() => {
        count++;
        return false;
      });
      assert.strictEqual(count, 1);
    });
  });

  describe('.toArray', function() {
    beforeEach(function() {
      for (let i = 0; i < 10000; i++) {
        set.add(i);
      }
    });

    it('should return an array of the proper length', function() {
      const array = set.toArray();
      assert.strictEqual(array.length, 10000);
    });

    it('should return an array with each element once', function() {
      const expected = {};
      for (let i = 0; i < 10000; i++) {
        expected[i] = 1;
      }
      const actual = {};
      set.toArray().forEach((i) => {
        actual[i] = (actual[i] || 0) + 1;
      });
      assert.deepEqual(actual, expected);
    });
  });
});
