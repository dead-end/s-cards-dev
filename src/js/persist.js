import { fetchLastModified, fetchJson } from './fetch';
import { arrGetProps, arrToMap } from './utils';

let db;

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
 * @param {*} e
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

    storeConfig.transaction.oncomplete = (e) => {
      console.log('Upgrade completed!');
    };
  }
};

/**
 *
 * @param {*} topicsJson
 */
const syncTopics = (topicsJson) => {
  console.log(topicsJson);

  const topicStore = db
    .transaction(['topics'], 'readwrite')
    .objectStore('topics');

  topicStore.getAll().onsuccess = (e) => {
    const topicsStore = e.target.result;

    const storeMap = arrToMap(topicsStore, 'file');

    const jsonKeys = arrGetProps(topicsJson, 'file');
    console.log('keysJson', jsonKeys);

    for (let storeKey in storeMap) {
      console.log(storeKey);
      if (!jsonKeys.includes(storeKey)) {
        topicStore.delete(storeKey).onsuccess = (e) => {
          console.log('Store: ', topicStore.name, ' deleted: ', storeKey);
        };
      }
    }

    topicsJson.forEach((jsonItem) => {
      //
      // Copy last modified if present.
      //
      const storeItem = storeMap.get(jsonItem.file);
      if (storeItem && storeItem.lastModified) {
        jsonItem.lastModified = storeItem.lastModified;
      }

      topicStore.put(jsonItem).onsuccess = (e) => {
        console.log('Store: ', topicStore.name, ' update: ', e.target.result);
      };
    });
  };
};

const storeDeleteIndex = (tx, storeName, indexName, indexValue) => {
  return new Promise((resolve, reject) => {
    const store = tx.objectStore(storeName);

    store.index(indexName).getAllKeys(indexValue).onsuccess = (e) => {
      const keys = e.target.result;
      keys.forEach((key) => {
        store.delete(key).onsuccess = (e) => {
          console.log('Store: ', store.name, ' deleted: ', key);
        };
      });
      resolve();
    };
  });
};

const storeAddAll = (tx, storeName, arr) => {
  return new Promise((resolve, reject) => {
    const store = tx.objectStore(storeName);

    arr.forEach((item) => {
      store.add(item).onsuccess = (e) => {
        console.log('Store: ', store.name, '  added: ', item);
      };
    });
  });
};

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

const storeSetTopicsLM = (lm) => {
  return new Promise((resolve, reject) => {
    db
      .transaction(['config'], 'readwrite')
      .objectStore('config')
      .put({ key: 'topics-last-modified', value: lm }).onsuccess = () => {
      console.log('update: topics-last-modified with: ', lm);
      resolve();
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
      syncTopics(json);
      // storeSetTopicsLM(headLm);
      setTopicsLastModified(headLm);
    });
  }
};

// ------------------------------------

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
