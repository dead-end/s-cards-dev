// TODO: rename file
import { fetchLastModified, fetchJson } from './fetch';
import { storeAddAll } from './store';
import { Topic, topicGetLastModified, topicSetLastModified, topicSync } from './topicModel';
import { questInit, questRemoveFile } from './questModel'
import { dbcGetLastModified, dbcSetLastModified } from './dbConfig';
import { db, dbInit } from './db';

/**
 * The function is called with the file name of a topic. It checks if an update
 * of the stored questions of a topic is necessary and if so, if does the
 * update.
 */
export const loadQuestions = async (file: string) => {
  console.log(file);

  //
  // Compare the last modified date of the stored topic file, with the last
  // modified date of the file on the server, to decide if an update is
  // necessary.
  //
  const storeLm = topicGetLastModified(file);
  const jsonLm = fetchLastModified(file);

  const [lmStore, lmJson] = await Promise.all([storeLm, jsonLm]);
  console.log('lmStore', lmStore, 'lmJson', lmJson);

  if (!lmJson) {
    return;
  }

  if (lmStore && lmStore >= lmJson) {
    return;
  }

  // TODO: error handling
  const json = await fetchJson(file);

  json.forEach(quest => questInit(quest, file));
  console.log(json);

  //
  // At this point we know that we have to update the questions for the topic.
  //
  const tx = db.transaction(['topics', 'questions'], 'readwrite');

  questRemoveFile(tx, file).then(() => {

    storeAddAll(tx, 'questions', json).then(() => {

      //
      // The last step is to update the last modified value for the topic file.
      //
      topicSetLastModified(tx, file, lmJson);
    });
  });
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

  // TODO: move to dbcGetLastModified / fetchLastModified
  console.log('last modified store:', storeLm);
  console.log('last modified head:', headLm);

  //
  // Explicite check for typescript
  //
  if (!headLm) {
    return;
  }

  if (storeLm !== null || storeLm < headLm) {
    //
    // TODO: comment => TopicList.svelte has to wait for the sync to finish
    // We have to wait for the sync before view can read from the store
    //
    // TODO: error handling
    await fetchJson('data/topics.json').then((json) => {
      topicSync(json as Array<Topic>);
      dbcSetLastModified(headLm);
    });
  }
};
