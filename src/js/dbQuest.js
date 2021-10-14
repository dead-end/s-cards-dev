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

export const dbqSetCurrent = (file, value) => {
  const store = db
    .transaction(['questions'], 'readwrite')
    .objectStore('questions');

  store.index('file').getAll(file).onsuccess = (e) => {
    const quests = e.target.result;
    quests.forEach((elem) => {
      elem.current = value;
      store.put(elem);
    });
  };
};

export const dbqGetStats = (file, value) => {
  return new Promise((resolve, reject) => {
    const store = db
      .transaction(['questions'], 'readwrite')
      .objectStore('questions');

    store.index('file').getAll(file).onsuccess = (e) => {
      const quests = e.target.result;
      resolve(quests.map((q) => q.current));
    };
  });
};
