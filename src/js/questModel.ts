import type { Topic } from './topicModel'
import { dbPromise } from './db'
import { percentage, shuffleArr } from './utils'
import { storeAdd, storePut, storeDel, storeDeleteIndex } from './store'
import { githubGetJson } from './github'

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

  return new Promise<void>((resolve) => {

    dbPromise.then(db => {
      const store = db
        .transaction(['questions'], 'readwrite')
        .objectStore('questions')

      store.put(quest).onsuccess = () => {
        console.log('Store:', store.name, ' update:', quest)
        resolve()
      }
    })
  })
}

/**
 * The function gets all questions for a topic from the store. It returns a 
 * promise with an array of questions. It is a wrapper, that gets a store and
 * calls the function below.
 */
export const questGetAll = async (topic: Topic) => {

  const store = (await dbPromise)
    .transaction(['questions'], 'readonly')
    .objectStore('questions')

  return questGetAllTx(store, topic)
}

/**
 * The function gets all questions for a topic from the store. It returns a 
 * promise with an array of questions.
 */

const questGetAllTx = (store: IDBObjectStore, topic: Topic) => {

  return new Promise<Question[]>((resolve) => {

    const request = store.index('file').getAll(topic.file)

    request.onsuccess = () => {
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

  return new Promise<number[]>((resolve) => {

    const result: number[] = []
    //
    // We are only interested in questions from a given file.
    //
    const range = IDBKeyRange.only(file)

    dbPromise.then(db => {

      const store = db
        .transaction(['questions'], 'readwrite')
        .objectStore('questions')

      const request = store.index('file').openCursor(range)

      request.onsuccess = () => {
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
  })
}

/**
 * The functions is called with an array of questions (from tags). The progress
 * of each question is set to a given number (0-2).
 */
export const questSetProgressArr = async (quests: Question[], value: number) => {

  const store = (await dbPromise)
    .transaction(['questions'], 'readwrite')
    .objectStore('questions')

  const promises: Promise<void>[] = quests.map(quest => {
    quest.progress = value

    return new Promise<void>((resolve) => {
      store.put(quest).onsuccess = () => {
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
export const questGetTag = async (topics: Topic[], numQuests: number, fraction: number) => {
  //
  // We use one transaction / store for all topics
  //
  const store = (await dbPromise)
    .transaction(['questions'], 'readonly')
    .objectStore('questions')

  const promises: Promise<Question[]>[] = []
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
    let all: Question[] = ([] as Question[]).concat(...arrOfArr)
    //
    // First we shuffle the array and the we sort it. The sorting effects only
    // questions with different ratios. The shuffling then effects questions 
    // with the same ratio.
    //
    shuffleArr(all)
    //
    // Sort the array with the highest ratio first.
    //
    all.sort((a: Question, b: Question) => {
      return b.ratio - a.ratio
    })
    //
    // If we want all, then we get all.
    //
    if (numQuests <= 0) {
      return all
    }
    //
    // We select the part of the questions with the highest ratio. We shuffle
    // this part and return the requested number of questions.
    //
    const part = Math.round(all.length * fraction)
    console.log('max:', numQuests, 'part:', part, 'fraction:', fraction);
    if (part > numQuests) {
      all = all.splice(0, part)
      shuffleArr(all)
    }

    //
    // Return an array with up to max members.
    //
    return all.splice(0, numQuests)
  })
}

/**
 * The function syncs the questions from a json file with the corresponding 
 * questions in the store.
 */
export const questSync = (tx: IDBTransaction, file: string, json: Question[]) => {

  const store = tx.objectStore('questions')

  const request = store.index('file').getAll(file)

  request.onsuccess = () => {

    const jMap = questArrToMap(json)
    const sMap = questArrToMap(request.result)

    //
    // Remove the unnecessary questions.
    //
    sMap.forEach(quest => {
      if (!jMap.has(quest.id)) {
        storeDel(store, quest.id)
      }
    })

    jMap.forEach(quest => {

      const sQuest = sMap.get(quest.id);
      if (sQuest) {
        questCopyPart(sQuest, quest)
        storePut(store, quest)

      } else {
        questInit(quest, file)
        storeAdd(store, quest)
      }
    })
  }
}

/**
 * The function reads a question from the store.
 */
export const questGet = (store: IDBObjectStore, id: string) => {

  return new Promise<Question>((resolve, reject) => {

    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = (e) => {
      console.log('Store:', store.name, 'questGet:', e)
      reject()
    }
  })
}

/**
 * The function creates an array with backup data from the store.
 */
export const questGetBackup = () => {

  return new Promise<[string, number, number][]>((resolve, reject) => {

    const result: [string, number, number][] = []

    dbPromise.then(db => {

      const store = db
        .transaction(['questions'], 'readonly')
        .objectStore('questions')

      const request = store.openCursor()

      request.onsuccess = () => {

        const cursor = request.result
        if (cursor) {

          const quest: Question = cursor.value
          result.push([
            quest.id,
            quest.failed,
            quest.total
          ])
          cursor.continue()
        }

        else {
          console.log('Store:', store.name, 'questGetBackup finished:', result.length)
          resolve(result)
        }
      }

      request.onerror = (e) => {
        console.log('Store:', store.name, 'questGetBackup:', e)
        reject()
      }
    })
  })
}

/**
 * The function writes the restore data to the store. This is done only if the 
 * restored total value is greater than the total value from the store. This
 * prevents the function from overwriting the store with stale backup data.
 */
export const questSetRestore = async (restore: [string, number, number][]) => {

  const store = (await dbPromise)
    .transaction(['questions'], 'readwrite')
    .objectStore('questions')

  restore.forEach(a => {
    const [id, failed, total] = [...a]

    questGet(store, id).then(quest => {

      if (quest && quest.total < total) {

        quest.failed = failed
        quest.total = total
        quest.ratio = percentage(quest.failed, quest.total)

        storePut(store, quest)
      }
    })
  })
}

/**
 * Load the questions from the store
 */
export const questLoad = async (file: string) => {

  const json = await githubGetJson(file)
  if (json) {
    const tx = (await dbPromise).transaction(['questions'], 'readwrite')
    questSync(tx, file, json)
  }
}

/**
 * Question array to map.
 */
export const questArrToMap = (arr: Array<Question>) => {
  const map = new Map<string, Question>()

  arr.forEach((quest) => {
    map.set(quest.id, quest)
  })
  return map
}