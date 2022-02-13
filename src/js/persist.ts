// TODO: rename file
import { Topic, topicSync } from './topicModel'
import { questSync } from './questModel'
import { db, dbInit } from './db'
import { githubGetJson } from './github'

/**
 * Load the questions from the store
 */
export const loadQuestions = async (file: string) => {

  const json = await githubGetJson(file)
  if (json) {
    const tx = db.transaction(['questions'], 'readwrite')
    questSync(tx, file, json)
  }
}

/**
 * Init app and load topics.
 */
export const initApp = async () => {
  //
  // Ensure that the database is initialized before we go on.
  //
  await dbInit()

  const json = await githubGetJson('data/topics.json')
  if (json) {
    topicSync(json as Array<Topic>)
  }
}