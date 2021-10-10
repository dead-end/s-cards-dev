export let db;

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
export const dbInit = () => {
  return new Promise((resolve, reject) => {
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
      resolve();
    };
  });
};
