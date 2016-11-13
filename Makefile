.PHONY: test dist

lib: src
	$$(npm bin)/babel $< --out-dir $@

test:
	npm test

dist: dist/gsheets.js dist/gsheets.min.js

dist/gsheets.js: src/index.js node_modules
	node_modules/.bin/webpack $< $@ --output-library=gsheets --output-library-target=umd

dist/gsheets.min.js: src/index.js node_modules
	node_modules/.bin/webpack $< $@ -p --output-library=gsheets --output-library-target=umd

node_modules: package.json
	npm install --ignore-scripts
	touch $@
