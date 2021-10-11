import { fetchLastModified, fetchJson } from './fetch';
import { storeDeleteIndex, storeAddAll } from './store';
import { dbtGetLastModified, dbtSetLastModified, dbtSync } from './dbTopics';
import { dbcGetLastModified, dbcSetLastModified } from './dbConfig.js';
import { db, dbInit } from './db';

/**
 *
 * @param {*} file
 */
export const loadQuestions = async (file) => {
  console.log(file);

  const storeLm = dbtGetLastModified(file);
  const jsonLm = fetchLastModified(file);

  const [lmStore, lmJson] = await Promise.all([storeLm, jsonLm]);

  console.log('lmStore', lmStore, 'lmJson', lmJson);
  if (lmStore && lmStore >= lmJson) {
    return;
  }

  const jsonPromise = await fetchJson(file);

  const tx = db.transaction(['topics', 'questions', 'progress'], 'readwrite');

  const promDelQuest = storeDeleteIndex(tx, 'questions', 'file', file);
  const promDelProgress = storeDeleteIndex(tx, 'progress', 'file', file);

  const [json] = await Promise.all([
    jsonPromise,
    promDelQuest,
    promDelProgress,
  ]);

  console.log(json);

  json.forEach((j) => (j.file = file));

  storeAddAll(tx, 'questions', json);
  dbtSetLastModified(tx, file, lmJson);
};

// -----------------------------

export const initApp = async () => {
  //
  // Ensure that the database is initialized before we go on.
  //
  await dbInit();

  const storeLmPromise = dbcGetLastModified();

  const headLmPromise = fetchLastModified('data/topics.json');

  const [storeLm, headLm] = await Promise.all([storeLmPromise, headLmPromise]);

  console.log('last modified store:', storeLm);
  console.log('last modified head:', headLm);

  if (!storeLm || storeLm < headLm) {
    //
    // TODO: comment => TopicList.svelte has to wait for the sync to finish
    // We have to wait for the sync before view can read from the store
    //
    await fetchJson('data/topics.json').then((json) => {
      dbtSync(json);
      dbcSetLastModified(headLm);
    });
  }
};
