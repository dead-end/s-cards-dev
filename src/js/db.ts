import { errorStore } from '../stores/errorStore'

const DB_VERSION = 4

/**
 * Simple error callback function.
 */
// TODO: define type!
const onError = (event: Event) => {
  errorStore.addError(event.type)
}

/**
 * The function implements an update for the indexeddb from version 0 to 
 * version 1.
 */
const initAndUpdate = (db: IDBDatabase) => {

  //
  // Create topics store
  //
  if (!db.objectStoreNames.contains('topics')) {
    db.createObjectStore('topics', {
      keyPath: 'file',
    })
  }

  //
  // Create questions store
  //
  if (!db.objectStoreNames.contains('questions')) {
    const storeQuest = db.createObjectStore('questions', {
      keyPath: 'id', autoIncrement: true
    })

    if (!storeQuest.indexNames.contains('file')) {
      storeQuest.createIndex('file', 'file', { unique: false })
    }
  }

  //
  // Create config store
  //
  if (!db.objectStoreNames.contains('hash')) {
    const storeHash = db.createObjectStore('hash', {
      keyPath: 'file',
    })

    storeHash.transaction.oncomplete = () => {
      console.log('Upgrade completed!')
    }
  }

  if (!db.objectStoreNames.contains('admin')) {
    db.createObjectStore('admin', {
      keyPath: 'config',
    })
  }

  //
  // Create config store
  //
  if (db.objectStoreNames.contains('config')) {
    db.deleteObjectStore('config')
  }
}

/**
 * The function iniitalizes the indexed db.
 */
export const dbInit = () => {
  //
  // The function returns a promise to be able to wait for the db to be
  // initialized, before we go on.
  //
  return new Promise<IDBDatabase>((resolve, reject) => {
    //
    // Open db request for version 1.
    //
    const request = indexedDB.open('s-card', DB_VERSION)

    //
    // Callback function for creating or upgrading the db.
    //
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      //
      // Set the database.
      //
      const db = request.result

      if (event.oldVersion < DB_VERSION) {
        initAndUpdate(db)
      }

      resolve(db)
    }

    //
    // Error handling callback function for the opening request.
    //
    request.onerror = (event: Event) => {
      errorStore.addError(event.type)
      reject()
    }

    request.onsuccess = () => {
      //
      // Set the database.
      //
      const db = request.result

      //
      // Centeralized error handling callback function.
      //
      db.onerror = onError
      console.log('db init success!')
      resolve(db)
    }
  })
}

export const dbPromise = dbInit()