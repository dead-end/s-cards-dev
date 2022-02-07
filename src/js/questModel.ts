import type { Topic } from './topicModel'
import { db } from './db'
import { percentage, arrToMap } from './utils'
import { storeAdd, storePut, storeDel, storeDeleteIndex } from './store'

/**
 * The interface defines a question persisted in the database. The id is auto 
 * generated, by the database.
 */
export interface Question {
  id: string,
  file: string,
  quest: string[],
  answer: string[],
  total: number
  failed: number
  //
  // The ratio can be computed in the componente, but we need it for selections.
  //
  ratio: number
  progress: number
}

/**
 * The function initializes a question that was loaded from a topic file. The
 * input is not a question. It is the data from the json. The added properties
 * are missing.
 */
const questInit = (quest: Question, file: string) => {
  quest.file = file
  quest.total = 0
  quest.failed = 0
  quest.ratio = 0.0
  quest.progress = 0
}

/**
 * The function copies parts from the store, that are not provided in the json.
 */
const questCopyPart = (from: Question, to: Question) => {

  //
  // Ensure that the questions are ok.
  //
  if (from.id !== to.id) {
    throw Error(`Unable to copy question parts: ${from.id} - ${to.id}`)
  }
  to.file = from.file
  to.total = from.total
  to.failed = from.failed
  to.ratio = from.ratio
  to.progress = from.progress
}

/**
 * The function is called with an array of questions and counts the number of 
 * correct answers for each question. It returns an array with integers. 
 */
export const questGetStatistics = (quests: Question[]) => {
  const statistic = [0, 0, 0, 0]

  quests.forEach((a) => {
    statistic[a.progress]++
  })

  return statistic
}

/**
 * The function is called with a question and a boolean value indicating if the
 * answer was correct. It updates the question, which then has to be persisted.
 */
export const questOnAnswer = (quest: Question, isCorrect: boolean) => {

  if (isCorrect) {
    quest.progress++
  } else {
    quest.progress = 0
    quest.failed++
  }

  quest.total++
  quest.ratio = percentage(quest.failed, quest.total)
}

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
  )
}

/**
 * The function is called with a question, which should be persisted. It 
 * returns a Promise.
 */
export const questPersist = (quest: Question) => {

  return new Promise<void>((resolve, reject) => {

    const store = db
      .transaction(['questions'], 'readwrite')
      .objectStore('questions')

    store.put(quest).onsuccess = (e) => {
      console.log('Store:', store.name, ' update:', quest)
      resolve()
    }
  })
}

/**
 * The function gets all questions for a topic from the store. It returns a 
 * promise with an array of questions. It is a wrapper, that gets a store and
 * calls the function below.
 */
export const questGetAll = (topic: Topic) => {

  const store = db
    .transaction(['questions'], 'readonly')
    .objectStore('questions')

  return questGetAllTx(store, topic)
}

/**
 * The function gets all questions for a topic from the store. It returns a 
 * promise with an array of questions.
 */

const questGetAllTx = (store: IDBObjectStore, topic: Topic) => {

  return new Promise<Question[]>((resolve, reject) => {

    const request = store.index('file').getAll(topic.file)

    request.onsuccess = (e) => {
      resolve(request.result)
    }
  })
}

/**
 * The function collects the 'progress' property from questions that are from a
 * given file. It returns an array with the 'progress' values.
 */
// TODO: This is reading questions and mapping them to progress. This can be 
// done simpler with questGetAll().map()
export const questGetStats = (file: string) => {

  return new Promise<number[]>((resolve, reject) => {

    const result: number[] = []
    //
    // We are only interested in questions from a given file.
    //
    const range = IDBKeyRange.only(file)

    const store = db
      .transaction(['questions'], 'readwrite')
      .objectStore('questions')

    const request = store.index('file').openCursor(range)

    request.onsuccess = (e) => {
      //
      // The result coontains the cursor.
      //
      const cursor = request.result
      if (cursor) {
        //
        // The cursor value is our question.
        //
        const quest: Question = cursor.value
        result.push(quest.progress)
        cursor.continue()
      }
      //
      // The cursor has finished.
      //
      else {
        console.log('Store:', store.name, 'progress values:', result)
        resolve(result)
      }
    }
  })
}

/**
 * The functions is called with an array of questions (from tags). The progress
 * of each question is set to a given number (0-2).
 */
export const questSetProgressArr = async (quests: Question[], value: number) => {

  const store = db
    .transaction(['questions'], 'readwrite')
    .objectStore('questions')

  const promises: Promise<void>[] = quests.map(quest => {
    quest.progress = value

    return new Promise<void>((resolve, reject) => {
      store.put(quest).onsuccess = (e) => {
        resolve()
      }
    })
  })

  await Promise.all(promises)
}

/**
 * The function is called with an array of topics. It reads all questions from 
 * the topics, sorts them by the ration and returns a Promise for an array with
 * max elements with the highest ratios.
 */
export const questGetTag = async (topics: Topic[], max: number) => {
  //
  // We use one transaction / store for all topics
  //
  const store = db
    .transaction(['questions'], 'readonly')
    .objectStore('questions')

  let promises: Promise<Question[]>[] = []
  //
  // Get a promise for the questions for each topic.
  //
  topics.forEach(t => {
    promises.push(questGetAllTx(store, t))
  })
  //
  // When we got the question array from all topics, we aggregate and sort them
  // and return a slice. 
  //
  return Promise.all(promises).then(arrOfArr => {
    //
    // Each promise returns an array of questions and we have to concatinate 
    // them all.
    //
    let all: Question[] = [].concat(...arrOfArr)
    //
    // Sort the array with the highest ratio first.
    //
    all.sort((a: Question, b: Question) => {
      return b.ratio - a.ratio
    })
    //
    // Return an array with up to max members.
    //
    return all.splice(0, max)
  })
}

/**
 * The function syncs the questions from a json file with the corresponding 
 * questions in the store.
 */
export const questSync = (tx: IDBTransaction, file: string, json: Question[]) => {

  const store = tx.objectStore('questions')

  const request = store.index('file').getAll(file)

  request.onsuccess = (e) => {

    const jMap = arrToMap<Question>(json, 'id')
    const sMap = arrToMap<Question>(request.result, 'id')
    //
    // Remove the unnecessary questions.
    //
    sMap.forEach(quest => {
      if (!jMap.has(quest.id)) {
        storeDel(store, quest.id)
      }
    })

    jMap.forEach(quest => {

      if (sMap.has(quest.id)) {
        questCopyPart(sMap.get(quest.id), quest)
        storePut(store, quest)

      } else {
        questInit(quest, file)
        storeAdd(store, quest)
      }
    })
  }
}