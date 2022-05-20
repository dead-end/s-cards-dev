import { dbPromise } from './db'
import { hashDelTx } from './hash'
import { questRemoveFile } from './questModel'
import { storePut, storeDel } from './store'
import { arrIsEqual } from './utils'
import { githubGetJson } from './github'

/**
 * The interface defines a topic persisted in the database.
 */
export interface Topic {
  //
  // The file of the topic, which is the primary key for the database.
  //
  file: string,
  //
  // The title of the topic.
  //
  title: string,
  //
  // An array with tags assosiated with the topic.
  //
  tags: string[],
  //
  // A description of the topic.
  //
  desc: string,
  //
  // A detailed message, which will be displayed on all answers of the topic.
  //
  details?: string[],
  //
  // The date when the user learned the last time.
  //
  lastLearned?: Date,
}

/**
 * The function compares two topics, one from the json and one from the store.
 */
const topicNeedUpdate = (json: Topic, store: Topic | void) => {
  //
  // If the topic is not in the store, we have to persist it.
  //
  if (!store) {
    return true
  }
  //
  // Preserve last learned.
  //
  if (store.lastLearned) {
    json.lastLearned = store.lastLearned
  }
  //
  // Compare the topic values that came from the topics file.
  //
  if (json.title !== store.title ||
    json.desc !== store.desc ||
    !arrIsEqual(json.tags, store.tags) ||
    !arrIsEqual(json.details, store.details)) {
    return true
  }

  return false
}

/**
 * The function returns a sorted array of unique tags.
 */
export const topicGetTags = (topics: Topic[]) => {

  const tags: string[] = []
  //
  // Iterate over the topics, which contain an array of tags.
  //
  topics.forEach((topic) => {
    //
    // Iterate over the tags of the topic.
    //
    topic.tags.forEach((tag) => {
      //
      // Check if our tags array contains this tag
      //
      if (!tags.includes(tag)) {
        tags.push(tag)
      }
    })
  })

  return tags.sort()
}

/**
 * The function gets all topics from the store. It returns a promise with an
 * array of topics.
 */
export const topicGetAll = () => {

  return new Promise<Array<Topic>>((resolve, reject) => {

    dbPromise.then(db => {
      const store = db.transaction(['topics'], 'readonly').objectStore('topics')

      const request = store.getAll()

      request.onsuccess = () => {
        console.log('Store:', store.name, 'topicGetAll:')
        resolve(request.result)
      }

      request.onerror = (e) => {
        console.log('Store:', store.name, 'topicGetAll error:', e)
        reject()
      }
    })
  })
}

/**
 * The function writes the updated topic to the store.
 */
export const topicUpdate = async (topic: Topic) => {
  const store = (await dbPromise).transaction(['topics'], 'readwrite').objectStore('topics')
  storePut(store, topic)
}

/**
 * The function deletes a topic object in the store.
 */
export const topicDelTx = (tx: IDBTransaction, file: string) => {
  const store = tx.objectStore('topics')
  storeDel(store, file)
}

/**
 * The function is called with a json array that contains the topics. It
 * deletes all topics from the store, that are not contained in the json and
 * updates the rest.
 */
const topicSync = async (json: Array<Topic>) => {
  const tx = (await dbPromise).transaction(['topics', 'questions', 'hash'], 'readwrite')
  const storeTopic = tx.objectStore('topics')

  const request = storeTopic.getAll()

  request.onsuccess = () => {
    //
    // Create a map with the topics and the file as the key.
    //
    const storeMap = topicArrToMap(request.result)
    //
    // Get an array with the files from the json array. The file is the key for
    // the topics in the store and has to be unique.
    //
    const jsonKeys = json.map((item) => item['file'])
    //
    // Delete the topics from the store that are not in the json array.
    //
    for (const storeKey of storeMap.keys()) {

      if (!jsonKeys.includes(storeKey)) {
        topicDelTx(tx, storeKey)
        hashDelTx(tx, storeKey)
        questRemoveFile(tx, storeKey)
      }
    }

    //
    // Update the topics in the store.
    //
    json.forEach((jsonItem) => {
      //
      // If the topic from the store and from the server are different, we 
      // update the store. 
      //
      if (topicNeedUpdate(jsonItem, storeMap.get(jsonItem.file))) {
        storePut(storeTopic, jsonItem)
      }
    })
  }
}

/**
 * Topic array to map.
 */
export const topicArrToMap = (arr: Array<Topic>) => {
  const map = new Map<string, Topic>()

  arr.forEach((topic) => {
    map.set(topic.file, topic)
  })
  return map
}

/**
 * Load the topic and sync the result with the db.
 */
const topicSetup = async () => {

  const json = await githubGetJson('data/topics.json')
  if (json) {
    topicSync(json as Array<Topic>)
  }
}

topicSetup()