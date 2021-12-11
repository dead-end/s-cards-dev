import { db } from './db';
import { questRemoveFile } from './questModel';
import { arrToMap } from './utils';

/**
 * The interface defines a topic persisted in the database.
 */
export interface Topic {
  file: string,
  title: string,
  desc: string,
  lastModified?: Date
}

/**
 * The function reads the last modified date from the topics store for a given
 * file.
 */
export const topicGetLastModified = (file: string) => {
  return new Promise<Date>((resolve, reject) => {

    const store = db.transaction(['topics'], 'readonly').objectStore('topics');
    const request = store.get(file);

    request.onsuccess = (e) => {
      //
      // Get the topic object from the store. It is possible that the value is
      // undefined.
      //
      const lastModified: Date = request.result.lastModified;
      console.log('Store:', store.name, ' get lastModified:', lastModified);
      resolve(lastModified);
    };
  });
};

/**
 * The function stores the last modified date of a topic file in the topic
 * store.
 */
export const topicSetLastModified = (tx: IDBTransaction, file: string, lastModified: Date) => {

  const store = tx.objectStore('topics');
  const request = store.get(file);

  store.get(file).onsuccess = (e) => {
    //
    // Get the topic from the store and set the last modified date.
    //
    const topic: Topic = request.result;
    topic.lastModified = lastModified;

    //
    // Write the updated tpic to the store.
    //
    store.put(topic).onsuccess = () => {
      console.log('Store:', store.name, ' set lastModified:', topic);
    };
  };
};

/**
 * The function gets all topics from the store.
 *
 * @returns A Promise for the array with the topics.
 */
export const topicGetAll = () => {
  return new Promise<Array<Topic>>((resolve, reject) => {
    const store = db.transaction(['topics'], 'readonly').objectStore('topics');
    const request = store.getAll();
    request.onsuccess = (e) => {
      resolve(request.result);
    };
  });
};

/**
 * The function is called with a json array that contains the topics. It
 * deletes all topics from the store, that are not contained in the json and
 * updates the rest.
 *
 * @param {Array} json
 */

// TODO: Wrong place!! If file was removed, then the Question and process stores have to be also removed.

export const topicSync = (json: Array<Topic>) => {
  const tx = db.transaction(['topics', 'questions'], 'readwrite');
  const store = tx.objectStore('topics');
  const request = store.getAll();
  request.onsuccess = (e) => {
    //
    // Create a map with the topics and the file as the key.
    //
    const storeMap = arrToMap(request.result, 'file');

    //
    // Get an array with the files from the json array. The file is the key for
    // the topics in the store and has to be unique.
    //
    const jsonKeys = json.map((item) => item['file']);

    //
    // Delete the topics from the store that are not in the json array.
    //
    for (let storeKey of storeMap.keys()) {

      if (!jsonKeys.includes(storeKey)) {
        store.delete(storeKey).onsuccess = () => {
          console.log('Store:', store.name, ' deleted:', storeKey);
          questRemoveFile(tx, storeKey);
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
        console.log('Store:', store.name, ' update:', request.result);
      };
    });
  };
};