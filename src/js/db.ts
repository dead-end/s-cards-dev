export let db: IDBDatabase;

import { errorStore } from '../stores/errorStore';

/**
 * Simple error callback function.
 *
 * @param {*} event
 */
// TODO: define type
const onError = (event: Event) => {
  errorStore.addError(event.type);
};

/**
 * The function implements an update for the indexeddb from version 0 to 
 * version 1.
 */
const nullToOne = (event: IDBVersionChangeEvent) => {

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
  // Create config store
  //
  const storeConfig = db.createObjectStore('config', {
    keyPath: 'key',
  });

  storeConfig.transaction.oncomplete = () => {
    console.log('Upgrade completed!');
  };
};

/**
 * The function iniitalizes the indexed db.
 */
export const dbInit = () => {
  //
  // The function returns a promise to be able to wait for the db to be
  // initialized, before we go on.
  //
  return new Promise<void>((resolve, reject) => {
    //
    // Open db request for version 1.
    //
    const request = indexedDB.open('s-card', 1);

    //
    // Callback function for creating or upgrading the db.
    //
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      //
      // Set the database.
      //
      db = request.result;

      if (event.oldVersion < 1) {
        nullToOne(event);
      }
    }

    //
    // Error handling callback function for the opening request.
    //
    request.onerror = onError;

    request.onsuccess = (event: Event) => {
      //
      // Set the database.
      //
      db = request.result;

      //
      // Centeralized error handling callback function.
      //
      db.onerror = onError;
      console.log('db init success!');
      resolve();
    };
  });
};
