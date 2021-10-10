import { fetchLastModified, fetchJson } from './fetch';
import { storeDeleteIndex, storeAddAll } from './store';
import { dbtGetLastModified, dbtSetLastModified, dbtSync } from './dbTopics';
import { dbcGetLastModified, dbcSetLastModified } from './dbConfig.js';

let db;

/**
 *
 * @param {*} file
 */
export const loadQuestions = async (file) => {
  console.log(file);

  const storeLm = dbtGetLastModified(db, file);
  const jsonLm = fetchLastModified(file);

  const [lmStore, lmJson] = await Promise.all([storeLm, jsonLm]);

  console.log('lmStore', lmStore, 'lmJson', lmJson);
  if (lmStore && lmStore >= lmJson) {
    return;
  }

  const jsonPromise = await fetchJson(file);

  const tx = db.transaction(['topics', 'questions', 'progress'], 'readwrite');

  const promDelQuest = storeDeleteIndex(tx, 'questions', 'file', file);
  const promDelProgress = storeDeleteIndex(tx, 'progress', 'file', file);

  const [json] = await Promise.all([
    jsonPromise,
    promDelQuest,
    promDelProgress,
  ]);

  console.log(json);

  json.forEach((j) => (j.file = file));

  storeAddAll(tx, 'questions', json);
  dbtSetLastModified(tx, file, lmJson);
};

// -----------------------------

// Replace by:

const initApp = async () => {
  const storeLmPromise = dbcGetLastModified(db);

  const headLmPromise = fetchLastModified('data/topics.json');

  const [storeLm, headLm] = await Promise.all([storeLmPromise, headLmPromise]);

  console.log('last modified store:', storeLm);
  console.log('last modified head:', headLm);

  if (!storeLm || storeLm < headLm) {
    fetchJson('data/topics.json').then((json) => {
      dbtSync(db, json);
      dbcSetLastModified(db, headLm);
    });
  }
};

// ------------------------------------

/**
 * Simple error callback function.
 *
 * @param {*} event
 */
const onError = (e) => {
  console.error(e.target.error);
};

/**
 * The function create the object stores and indices.
 *
 * @param {IDBVersionChangeEvent} e
 */
const onUpgradeNeeded = (e) => {
  if (e.oldVersion < 1) {
    db = e.target.result;

    //
    // Create topics store
    //
    const storeTopics = db.createObjectStore('topics', {
      keyPath: 'file',
    });

    //
    // Create questions store
    //
    const storeQuest = db.createObjectStore('questions', {
      keyPath: 'id',
    });
    storeQuest.createIndex('file', 'file', { unique: false });

    //
    // Create progress store
    //
    const storeProgress = db.createObjectStore('progress', {
      keyPath: 'id',
    });
    storeProgress.createIndex('file', 'file', { unique: false });

    //
    // Create config store
    //
    const storeConfig = db.createObjectStore('config', {
      keyPath: 'key',
    });

    storeConfig.transaction.oncomplete = () => {
      console.log('Upgrade completed!');
    };
  }
};

/**
 * The function iniitalizes the indexed db.
 */
export const initDB = () => {
  //
  // Open db request for version 1.
  //
  const request = indexedDB.open('s-card', 1);

  //
  // Callback function for creating or upgrading the db.
  //
  request.onupgradeneeded = onUpgradeNeeded;

  //
  // Error handling callback function for the opening request.
  //
  request.onerror = onError;

  request.onsuccess = (e) => {
    //
    //
    //
    db = e.target.result;

    //
    // Centeralized error handling callback function.
    //
    db.onerror = onError;
    console.log('db init success!');

    //
    // Initialize the application.
    //
    initApp();
  };
};
