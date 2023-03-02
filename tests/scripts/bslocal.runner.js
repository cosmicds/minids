#!/usr/bin/env node

// This script (with slight modification) is from
// https://github.com/browserstack/nightwatch-browserstack/blob/master/scripts/local.runner.js

const nightwatch = require('nightwatch');
const browserstack = require('browserstack-local');
let bsLocal;

try {
  require.main.filename = './node_modules/.bin/nightwatch';
  // Code to start browserstack local before start of test
  console.log('Connecting local');
  nightwatch.bs_local = bsLocal = new browserstack.Local();
  bsLocal.start({ key: process.env.BROWSERSTACK_ACCESS_KEY }, function (error) {
    if (error) throw error;

    console.log('Connected. Now testing...');
    nightwatch.cli(function (argv) {
      nightwatch.CliRunner(argv)
        .setup()
        .runTests()
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          // Code to stop browserstack local after end of single test
          bsLocal.stop(function () {});
        });
    });
  });
} catch (ex) {
  console.log('There was an error while starting the test runner:\n\n');
  process.stderr.write(ex.stack + '\n');
  process.exit(2);
}
