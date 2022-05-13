// TODO: rename file
import { questSync } from './questModel'
import { githubGetJson } from './github'
import { dbPromise } from './db'
import { topicSync } from './topicModel'
import type { Topic } from './topicModel'

/**
 * Load the questions from the store
 */
export const loadQuestions = async (file: string) => {

  const json = await githubGetJson(file)
  if (json) {
    const tx = (await dbPromise).transaction(['questions'], 'readwrite')
    questSync(tx, file, json)
  }
}

/**
 * Init app and load topics.
 */
export const initApp = async () => {

  const json = await githubGetJson('data/topics.json')
  if (json) {
    topicSync(json as Array<Topic>)
  }
}