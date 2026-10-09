const fs = require('node:fs');
const path = require('node:path');
const util = require('node:util');

const logFilePath = path.join(__dirname, '..', 'logs.txt');
let fileErrorReported = false;

function appendToFile(args) {
  try {
    const line = util.format(...args);
    fs.appendFileSync(logFilePath, `${line}\n`, 'utf8');
  } catch (error) {
    // Logging must never terminate the web server.
    if (!fileErrorReported) {
      fileErrorReported = true;
      console.error('Не удалось записать лог в файл:', error.message);
    }
  }
}

function log(...args) {
  console.log(...args);
  appendToFile(args);
}

function info(...args) {
  console.info(...args);
  appendToFile(args);
}

function warn(...args) {
  console.warn(...args);
  appendToFile(args);
}

function error(...args) {
  console.error(...args);
  appendToFile(args);
}

module.exports = {
  log,
  info,
  warn,
  error,
  logFilePath
};
