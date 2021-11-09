// TODO: support typescript => Interface
// TODO: nename file => questModel.js
// function questPersist, questGetAll,
// questOnAnswer

import { db } from './db';
import { percentage } from './utils';

/**
 * The function sets all 'current' properties from questions from a given file
 * to a given value.
 *
 * @param {string} file The file name for the questions.
 * @param {number} value The new value.
 */
export const questSetProgress = (file, value) => {
  //
  // We are only interested in questions from a given file.
  //
  const range = IDBKeyRange.only(file);

  const store = db
    .transaction(['questions'], 'readwrite')
    .objectStore('questions');

  const request = store.index('file').openCursor(range);
  request.onsuccess = (e) => {
    const cursor = request.result;
    if (cursor) {
      const elem = cursor.value;
      //
      // Ensure that we need to update the value in the store.
      //
      if (elem.progress !== value) {
        elem.progress = value;
        elem.failed = 0;
        store.put(elem);
        console.log('Store:', store.name, ' update:', elem.id);
      }

      cursor.continue();
    }
    //
    // The cursor has finished.
    //
    else {
      console.log('Store:', store.name, ' set progress done:', value);
    }
  };
};

/**
 * The function collects the 'progress' property from questions that are from a
 * given file.
 *
 * @param {string} file The name of the file.
 * @returns An array with the 'progress' values.
 */
export const questGetStats = (file) => {
  return new Promise((resolve, reject) => {
    const result = [];

    //
    // We are only interested in questions from a given file.
    //
    const range = IDBKeyRange.only(file);

    const store = db
      .transaction(['questions'], 'readwrite')
      .objectStore('questions');

    const request = store.index('file').openCursor(range);

    request.onsuccess = (e) => {
      const cursor = request.result;
      if (cursor) {
        result.push(cursor.value.progress);
        cursor.continue();
      }
      //
      // The cursor has finished.
      //
      else {
        console.log('Store:', store.name, ' progress values:', result);
        resolve(result);
      }
    };
  });
};

/**
 * The function is called with an array of questions and counts the number of 
 * correct answers for each question.
 * 
 * @param {Array<any>} quests The array of questions that are processed.
 * @returns An array of integers.
 */
export const questGetStatistics = (quests) => {
  const statistic = [0, 0, 0, 0];

  quests.forEach((a) => {
    statistic[a.progress]++;
  });

  return statistic;
};

/**
 * The function is called with a question and a boolean value indicating if the
 * answer was correct.
 * 
 * @param {Object} quest The current question.
 * @param {boolean} isCorrect True if the answer was corrent.
 */
export const questOnAnswer = (quest, isCorrect) => {

  if (isCorrect) {
    quest.progress++;
  } else {
    quest.progress = 0;
    quest.failed++;
  }

  quest.total++;
  quest.ratio = percentage(quest.failed, quest.total);
};

/**
 * The function is called with a quest, which should be persisted.
 * 
 * @param {Object} quest 
 * @returns A Promise
 */
export const questPersist = (quest) => {

  return new Promise<void>((resolve, reject) => {

    const store = db
      .transaction(['questions'], 'readwrite')
      .objectStore('questions');

    store.put(quest).onsuccess = (e) => {
      console.log('Store:', store.name, ' update:', quest);
      resolve();
    };
  });
};

/**
 * The function gets all questions for a topic from the store.
 *
 * @returns A Promise for the array with the questions.
 */
export const questGetAll = (topic) => {

  return new Promise((resolve, reject) => {

    const store = db
      .transaction(['questions'], 'readonly')
      .objectStore('questions');

    const request = store.index('file').getAll(topic.file);

    request.onsuccess = (e) => {
      resolve(request.result);
    };
  });
};

/**
 * The function initializes a quest that was loaded from a topic file.
 * 
 * @param {Object} quest The question to be initialized.
 * @param {string} file The name of the topic file.
 */
export const questInit = (quest, file) => {
  quest.file = file;
  quest.total = 0;
  quest.failed = 0;
  quest.ratio = 0.0;
  quest.progress = 0;
}