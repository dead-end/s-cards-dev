import { fetchLastModified, fetchJson } from './fetch';
import { arrGetProps, arrToMap } from './utils';
import { storeDeleteIndex, storeAddAll } from './store';

let db;

const storeGetLastModified = (storeName, id) => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);

    store.get(id).onsuccess = (e) => {
      const prop = e.target.result;
      console.log('storeGetLastModified', prop);
      if (prop && prop.lastModified) {
        resolve(prop.lastModified);
      } else {
        resolve();
      }
    };
  });
};

const storeTopicSetLastModified = (tx, file, lm) => {
  const store = tx.objectStore('topics');

  store.get(file).onsuccess = (e) => {
    const prop = e.target.result;
    prop.lastModified = lm;

    store.put(prop).onsuccess = () => {
      console.log('Store: ', store.name, ' setLastModified: ', prop);
    };
  };
};

/**
 *
 * @param {*} file
 */
export const loadQuestions = async (file) => {
  console.log(file);

  const storeLm = storeGetLastModified('topics', file);
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
  storeTopicSetLastModified(tx, file, lmJson);
};

// -----------------------------

// Replace by:

const topicsLastModifiedStore = () => {
  return new Promise((resolve, reject) => {
    db
      .transaction(['config'], 'readonly')
      .objectStore('config')
      .get('topics-last-modified').onsuccess = (e) => {
      const prop = e.target.result;

      if (prop) {
        resolve(prop.value);
      } else {
        resolve();
      }
    };
  });
};

const setTopicsLastModified = (lm) => {
  db
    .transaction(['config'], 'readwrite')
    .objectStore('config')
    .put({ key: 'topics-last-modified', value: lm }).onsuccess = () => {
    console.log('update: topics-last-modified with: ' + lm);
  };
};

const initApp = async () => {
  const tlmStore = topicsLastModifiedStore();

  const tlmHead = fetchLastModified('data/topics.json');

  const [storeLm, headLm] = await Promise.all([tlmStore, tlmHead]);

  console.log('store', storeLm);
  console.log('head', headLm);

  if (!storeLm || storeLm < headLm) {
    fetchJson('data/topics.json').then((json) => {
      topicsSync(json);
      // storeSetTopicsLM(headLm);
      setTopicsLastModified(headLm);
    });
  }
};

// ------------------------------------

/**
 * The function is called with a json array that contains the topics. It
 * deletes all topics from the store, that are not contained in the json and
 * updates the rest.
 *
 * @param {Array} json
 */
const topicsSync = (json) => {
  const store = db.transaction(['topics'], 'readwrite').objectStore('topics');

  store.getAll().onsuccess = (e) => {
    //
    // Create a map with the topics and the file as the key.
    //
    const storeMap = arrToMap(e.target.result, 'file');

    //
    // Get an array with the files from the json array. The file is the key for
    // the topics in the store and has to be unique.
    //
    const jsonKeys = arrGetProps(json, 'file');

    //
    // Delete the topics from the store that are not in the json array.
    //
    for (let storeKey in storeMap) {
      if (!jsonKeys.includes(storeKey)) {
        store.delete(storeKey).onsuccess = () => {
          console.log('Store: ', store.name, ' deleted: ', storeKey);
        };
      }
    }

    //
    // Update the topics in the store.
    //
    json.forEach((jsonItem) => {
      //
      // Copy last modified if present.
      //
      const storeItem = storeMap.get(jsonItem.file);
      if (storeItem && storeItem.lastModified) {
        jsonItem.lastModified = storeItem.lastModified;
      }

      store.put(jsonItem).onsuccess = (e) => {
        console.log('Store: ', store.name, ' update: ', e.target.result);
      };
    });
  };
};

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
