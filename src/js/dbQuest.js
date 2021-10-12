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
