// BELOW OK----

import type { Topic } from './topicModel';
import { db } from './db';
import { percentage } from './utils';
import { storeDeleteIndex } from './store';

/**
 * The interface defines a question persisted in the database. The id is auto 
 * generated, by the database.
 */
export interface Question {
  id: number,
  file: string,
  quest: string[],
  answer: string[],
  total: number;
  failed: number;
  //
  // The ratio can be computed in the componente, but we need it for selections.
  //
  ratio: number;
  progress: number;
}

/**
 * The function initializes a question that was loaded from a topic file. The
 * input is not a question. It is the data from the json. The added properties
 * are missing.
 */
export const questInit = (quest: Question, file: string) => {
  quest.file = file;
  quest.total = 0;
  quest.failed = 0;
  quest.ratio = 0.0;
  quest.progress = 0;
}

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
 * The function is called with a question and a boolean value indicating if the
 * answer was correct. It updates the question, which then has to be persisted.
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
 * The function removes all questions from a given file from the store. It 
 * returns a promise.
 */
export const questRemoveFile = (tx: IDBTransaction, file: string) => {

  return storeDeleteIndex(
    tx,
    'questions',
    'file',
    file
  );
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
 * The function gets all questions for a topic from the store. It returns a 
 * promise with an array of questions.
 */
export const questGetAll = (topic: Topic) => {

  return new Promise<Question[]>((resolve, reject) => {

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
 * The function collects the 'progress' property from questions that are from a
 * given file. It returns an array with the 'progress' values.
 */
export const questGetStats = (file: string) => {

  return new Promise<number[]>((resolve, reject) => {

    const result: number[] = [];
    //
    // We are only interested in questions from a given file.
    //
    const range = IDBKeyRange.only(file);

    const store = db
      .transaction(['questions'], 'readwrite')
      .objectStore('questions');

    const request = store.index('file').openCursor(range);

    request.onsuccess = (e) => {
      //
      // The result coontains the cursor.
      //
      const cursor = request.result;
      if (cursor) {
        //
        // The cursor value is our question.
        //
        const quest: Question = cursor.value;
        result.push(quest.progress);
        cursor.continue();
      }
      //
      // The cursor has finished.
      //
      else {
        console.log('Store:', store.name, 'progress values:', result);
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
    //
    // The result coontains the cursor.
    //
    const cursor = request.result;
    if (cursor) {
      //
      // The cursor value is our question.
      //
      const quest: Question = cursor.value;
      //
      // Ensure that we need to update the value in the store.
      //
      if (quest.progress !== value) {
        quest.progress = value;
        store.put(quest);
        console.log('Store:', store.name, ' update:', quest.id);
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