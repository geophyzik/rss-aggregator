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

remove:
	rm -rf dist

# Runs the end-to-end tests.
test:
	npx playwright test

# npx playwright test --ui
test_ui:
	npx playwright test --ui

# Runs the tests only on Desktop Chrome.
test_chrom: 
	npx playwright test --project=chromium

# npx playwright test --debug
test_debug:
	npx playwright test --debug