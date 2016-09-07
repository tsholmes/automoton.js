'use strict';

module.exports.toCharCode = function(s) {
  if (typeof s === 'number') {
    return s;
  }
  if (typeof s !== 'string') {
    throw new Error(`${s} is not a string`);
  }
  if (s.length !== 1) {
    throw new Error(`Invalid character ${s}`);
  }
  return s.charCodeAt(0);
};
