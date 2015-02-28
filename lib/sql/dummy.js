'use strict';

/**
 * Common interface to all SQL databases. Implemented in this file as dummy
 * functions that store state in a plain object instead of connecting to a
 * database.
 *
 * @interface SQLDatabase
 */

var R = require('ramda');
var Promise = require('bluebird');

/**
 * Database connection, returned from {@link SQLDatabase.connect}.
 * @typedef {*} SQLDatabase~Connection
 */

/**
 * Connect to a database.
 * @alias SQLDatabase.connect
 * @param {Object} configuration - Connection configuration
 * @returns {Promise.<SQLDatabase~Connection>} Database connection
 */
function connect(configuration) {
  return Promise.resolve({
    live: {tables: {}},
    transaction: null,
    rollback: null
  });
}

/**
 * Disconnect from a database.
 * @alias SQLDatabase.disconnect
 * @param {SQLDatabase~Connection} db - Database connection
 * @returns {Promise.<*>}
 */
function disconnect(db) {
  return Promise.resolve();
}

/**
 * Begin a transaction.
 * @alias SQLDatabase.beginTransaction
 * @param {SQLDatabase~Connection} db - Database connection
 * @returns {Promise.<*>}
 */
function beginTransaction(db) {
  db.rollback = R.clone(db.live);
  db.transaction = R.clone(db.live);
  return Promise.resolve();
}

/**
 * Commit the current transaction.
 * @alias SQLDatabase.commitTransaction
 * @param {SQLDatabase~Connection} db - Database connection
 * @returns {Promise.<*>}
 */
function commitTransaction(db) {
  db.live = db.transaction;
  db.transaction = null;
  db.rollback = null;
  return Promise.resolve();
}

/**
 * Rollback the current transaction.
 * @alias SQLDatabase.rollbackTransaction
 * @param {SQLDatabase~Connection} db - Database connection
 * @returns {Promise.<*>}
 */
function rollbackTransaction(db) {
  db.live = db.rollback;
  db.transaction = null;
  db.rollback = null;
  return Promise.resolve();
}

/**
 * Create the migration journal table if it does not already exist. Curried.
 * @alias SQLDatabase.ensureJournal
 * @param {SQLDatabase~Connection} db - Database connection
 * @param {string} tableName - Name of the journal table
 * @returns {Promise.<*>}
 */
function ensureJournal(db, tableName) {
  var tables = (db.transaction || db.live).tables;
  if (!tables[tableName]) tables[tableName] = [];
  return Promise.resolve();
}

/**
 * Append an entry to the migration journal table. Curried.
 * @alias SQLDatabase.appendJournal
 * @param {SQLDatabase~Connection} db - Database connection
 * @param {string} tableName - Name of the journal table
 * @param {string} operation - Migration operation type
 * @param {string} migrationID - ID of the migration
 * @param {string} migrationName - Name of the migration
 * @returns {Promise.<*>}
 */
function appendJournal(db, tableName, operation, migrationID, migrationName) {
  var journal = (db.transaction || db.live).tables[tableName];
  journal.push({
    timestamp: new Date(),
    operation: operation,
    migrationID: migrationID,
    migrationName: migrationName
  });
  return Promise.resolve();
}

/**
 * Migration journal entry.
 * @typedef {Object} SQLDatabase.JournalEntry
 * @property {Date} timestamp - Timestamp the entry was written
 * @property {string} operation - Migration operation type
 * @property {string} migrationID - ID of the migration
 * @property {string} migrationName - Name of the migration
 */

/**
 * Read entries of the migration journal table, in the order they were added.
 * Curried.
 *
 * @alias SQLDatabase.readJournal
 * @param {SQLDatabase~Connection} db - Database connection
 * @param {string} tableName - Name of the journal table
 * @returns {Promise.<SQLDatabase.JournalEntry[]>}
 */
function readJournal(db, tableName) {
  return Promise.resolve((db.transaction || db.live).tables[tableName]);
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  beginTransaction: beginTransaction,
  commitTransaction: commitTransaction,
  rollbackTransaction: rollbackTransaction,
  ensureJournal: R.curry(ensureJournal),
  appendJournal: R.curry(appendJournal),
  readJournal: R.curry(readJournal)
};