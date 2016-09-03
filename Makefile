istanbul = ./node_modules/.bin/istanbul
mocha = ./node_modules/.bin/_mocha

node_modules: package.json $(wildcard node_modules/*/package.json)
	@npm install
	@touch $^

install: node_modules
.PHONY: install

test: install
	@$(istanbul) cover --print both $(mocha) -- $(wildcard test/*.test.js)
.PHONY: test
