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
export const questSetCurrent = (file, value) => {
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
 * @param {string} file The name of the file.
 * @returns An array with the 'current' values.
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
    statistic[a.current]++;
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
    quest.current++;
  } else {
    quest.current = 0;
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

  return new Promise((resolve, reject) => {

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

    store.index('file').getAll(topic.file).onsuccess = (e) => {
      resolve(e.target.result);
    };
  });
};