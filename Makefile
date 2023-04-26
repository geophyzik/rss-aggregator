develop:
	npx webpack serve

install:
	npm ci

build:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

build:
	NODE_ENV=production npx webpack

remove:
	rm -rf dist