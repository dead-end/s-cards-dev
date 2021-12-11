// TODO: support typescript => Interface
// TODO: nename file => questModel.js
// function questPersist, questGetAll,
// questOnAnswer

import { db } from './db';
import type { Topic } from './topicModel';
import { percentage } from './utils';
import { storeDeleteIndex } from './store';

/**
 * The interface defines a question persisted in the database.
 */
export interface Question {
  id: string,
  file: string,
  quest: string[],
  answer: string[],
  total: number;
  failed: number;
  ratio: number;
  progress: number;
}

/**
 * The function initializes a question that was loaded from a topic file.
 */
export const questInit = (quest: Question, file: string) => {
  quest.file = file;
  quest.total = 0;
  quest.failed = 0;
  quest.ratio = 0.0;
  quest.progress = 0;
}

/**
 * The function gets all questions for a topic from the store.
 *
 * @returns A Promise for the array with the questions.
 */
export const questGetAll = (topic: Topic) => {

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
 * The function is called with a question, which should be persisted. It 
 * returns a Promise.
 */
export const questPersist = (quest: Question) => {

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
 * The function is called with a question and a boolean value indicating if the
 * answer was correct.
 */
export const questOnAnswer = (quest: Question, isCorrect: boolean) => {

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
 * The function is called with an array of questions and counts the number of 
 * correct answers for each question. It returns an array with integers. 
 */
export const questGetStatistics = (quests: Question[]) => {
  const statistic = [0, 0, 0, 0];

  quests.forEach((a) => {
    statistic[a.progress]++;
  });

  return statistic;
};

/**
 * The function collects the 'progress' property from questions that are from a
 * given file. It returns an array with the 'progress' values.
 */
export const questGetStats = (file: string) => {
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
 * The function sets all 'current' properties from questions from a given file
 * to a given value.
 */
export const questSetProgress = (file: string, value: number) => {
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
 * The function removes all questions from a given file from the store. It 
 * returns a promise.
 */
// TODO: not sure if this is desired. Maybe we use an external transaction.
export const questRemoveFile = (file: string) => {

  //
  // Create a transaction for the deletion.
  //
  const tx = db.transaction(['questions'], 'readwrite')

  return storeDeleteIndex(
    tx,
    'questions',
    'file',
    file
  );
}