.PHONY: test dist

lib: src
	$$(npm bin)/babel $< --out-dir $@

test:
	npm test

dist: dist/gsheets.js dist/gsheets.min.js

gsheets.js: src/index.js
	BABEL_ENV=rollup $$(npm bin)/rollup $< --config=rollup.config.js --output=$@

gsheets.min.js: src/index.js
	NODE_ENV=production BABEL_ENV=rollup $$(npm bin)/rollup $< --config=rollup.config.js --output=$@

node_modules: package.json
	npm install --ignore-scripts
	touch $@
