'use strict';

const Automaton = require('./automaton');

const Datatypes = {};

Datatypes.ws = Automaton.minimize(Automaton.makeCharSet(' \t\n\r'));
