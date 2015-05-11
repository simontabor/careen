'use strict';

import childProcess = require('child_process');

import Promise = require('bluebird');
let exec = Promise.promisify(childProcess.exec);

import suite = require('./suite');
import postgresql = require('../../lib/client/postgresql');

let databaseID = 1;

suite<typeof postgresql, postgresql.Config>({
  prettyName: 'PostgreSQL',
  skip: process.env.TEST_SKIP_CLIENT_POSTGRESQL,
  client: postgresql,

  createDatabase: function() {
    let config = {database: 'careen-test-' + databaseID};
    databaseID++;
    return exec(`createdb ${config.database}`).return(config);
  },

  dropDatabase: function(config) {
    return exec(`dropdb ${config.database}`);
  }
});
