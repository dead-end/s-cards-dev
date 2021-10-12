import { fetchLastModified, fetchJson } from './fetch';
import { storeDeleteIndex, storeAddAll } from './store';
import { dbtGetLastModified, dbtSetLastModified, dbtSync } from './dbTopics';
import { dbcGetLastModified, dbcSetLastModified } from './dbConfig.js';
import { db, dbInit } from './db';

/**
 * The function is called with the file name of a topic. It checks if an update
 * of the stored questions of a topic is necessary and if so, if does the
 * update.
 *
 * @param {String} file
 */
export const loadQuestions = async (file) => {
  console.log(file);

  //
  // Compare the last modified date of the stored topic file, with the last
  // modified date of the file on the server, to decide if an update is
  // necessary.
  //
  const storeLm = dbtGetLastModified(file);
  const jsonLm = fetchLastModified(file);

  const [lmStore, lmJson] = await Promise.all([storeLm, jsonLm]);
  console.log('lmStore', lmStore, 'lmJson', lmJson);

  if (lmStore && lmStore >= lmJson) {
    return;
  }

  //
  // At this point we know that we have to update the questions for the topic.
  //
  const tx = db.transaction(['topics', 'questions', 'progress'], 'readwrite');

  const delQuestsPromise = storeDeleteIndex(tx, 'questions', 'file', file);
  const delProgressPromise = storeDeleteIndex(tx, 'progress', 'file', file);
  const jsonPromise = fetchJson(file);

  //
  // All three things can be done in parallel. Only the json promise returns
  // something.
  //
  const [json] = await Promise.all([
    jsonPromise,
    delQuestsPromise,
    delProgressPromise,
  ]);

  json.forEach((j) => (j.file = file));
  console.log(json);

  storeAddAll(tx, 'questions', json);

  //
  // The last step is to update the last modified value for the topic file.
  //
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
