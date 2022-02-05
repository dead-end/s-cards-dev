// TODO: rename file
import { fetchHash, fetchJson } from './fetch'
import { Topic, topicGet, topicUpdateTx, topicSync } from './topicModel'
import { questSync } from './questModel'
import { dbcSetConfig, dbcGetConfig } from './dbConfig'
import { db, dbInit } from './db'
import type { Config } from './dbConfig'

/**
 * The function is called with the file name of a topic. It checks if an update
 * of the stored questions of a topic is necessary and if so, if does the
 * update.
 */
export const loadQuestions = async (file: string) => {
  //
  // Get the hash value from the server and the topic from the store.
  //
  const topicPromise = topicGet(file)
  const headHashPromise = fetchHash(file)
  const [topic, headHash] = await Promise.all([topicPromise, headHashPromise])

  if (!headHash) {
    return
  }

  if (topic.hash && topic.hash === headHash) {
    console.log('Hashes are the same for:', file, topic.hash, headHash)
    return
  }

  //
  // Get the json file for the questions. If the result is 'undefined' then the
  // request fails.
  //
  const json = await fetchJson(file)
  if (!json) {
    return
  }

  //
  // At this point we know that we have to update the questions for the topic.
  //
  const tx = db.transaction(['topics', 'questions'], 'readwrite')

  questSync(tx, file, json)

  //
  // Update the topic timestamp and hash
  //
  topic.hash = headHash
  topic.lastLoaded = new Date()
  topicUpdateTx(tx, topic)
}

/**
 * 
 */
export const initApp = async () => {
  //
  // Ensure that the database is initialized before we go on.
  //
  await dbInit()
  //
  // Get the hash value from the server and the store.
  //
  const storeConfigPromise = dbcGetConfig<string>('topics-hash')
  const headHashPromise = fetchHash('data/topics.json')
  const [storeConfig, headHash] = await Promise.all([storeConfigPromise, headHashPromise])
  //
  // Explicite check for typescript
  //
  if (!headHash) {
    return
  }
  //
  // If there is a hash in the store and it does not change, there is nothing
  // to do.
  //
  const storeHash = storeConfig ? storeConfig.value : ''
  if (storeHash === headHash) {
    console.log('Hashes are the same for:', 'data/topics.json', storeHash, headHash)
    return
  }

  //
  // TODO: comment => TopicList.svelte has to wait for the sync to finish
  // We have to wait for the sync before view can read from the store
  //
  // TODO: error handling
  await fetchJson('data/topics.json').then((json) => {
    topicSync(json as Array<Topic>)
    //
    // Persist the new hash value.
    //
    const config: Config<string> = { key: 'topics-hash', value: headHash }
    dbcSetConfig(config)
  })
}
