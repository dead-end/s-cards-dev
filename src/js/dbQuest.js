import { db } from './db';

/**
 * The function gets all questions for a topic from the store.
 *
 * @returns A Promise for the array with the questions.
 */
export const dbqGetAll = (topic) => {
  return new Promise((resolve, reject) => {
    const store = db
      .transaction(['questions'], 'readonly')
      .objectStore('questions');

    store.index('file').getAll(topic.file).onsuccess = (e) => {
      resolve(e.target.result);
    };
  });
};

/**
 * The function sets all 'current' properties from questions from a given file
 * to a given value.
 *
 * @param {String} file The file name for the questions.
 * @param {Number} value The new value.
 */
export const dbqSetCurrent = (file, value) => {
  //
  // We are only interested in questions from a given file.
  //
  const range = IDBKeyRange.only(file);

  const store = db
    .transaction(['questions'], 'readwrite')
    .objectStore('questions');

  store.index('file').openCursor(range).onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const elem = cursor.value;
      //
      // Ensure that we need to update the value in the store.
      //
      if (elem.current !== value) {
        elem.current = value;
        store.put(elem);
        console.log('Store:', store.name, ' update:', elem.id);
      }

      cursor.continue();
    }
    //
    // The cursor has finished.
    //
    else {
      console.log('Store:', store.name, ' set current done:', value);
    }
  };
};

/**
 * The function collects the 'current' property from questions that are from a
 * given file.
 *
 * @param {String} file The name of the file.
 * @returns An array with the 'current' values.
 */
export const dbqGetStats = (file) => {
  return new Promise((resolve, reject) => {
    const result = [];

    //
    // We are only interested in questions from a given file.
    //
    const range = IDBKeyRange.only(file);

    const store = db
      .transaction(['questions'], 'readwrite')
      .objectStore('questions');

    store.index('file').openCursor(range).onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        result.push(cursor.value.current);
        cursor.continue();
      }
      //
      // The cursor has finished.
      //
      else {
        console.log('Store:', store.name, ' current values:', result);
        resolve(result);
      }
    };
  });
};
