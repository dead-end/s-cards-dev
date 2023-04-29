import type { Admin } from '../js/interfaces'
import { get, writable } from 'svelte/store'
import { dbPromise } from '../js/db'
import { storePut } from '../js/store'
import { ensureEnd } from '../js/utils'
import Result from '../js/result'

const langUrlDefault = 'https://api.github.com/repos/dead-end/cards-russian/contents/'

const linkUrlDefault = 'https://github.com/dead-end/cards-russian/blob/master/'

/**
 * The function reads the admin object from the indexeddb.
 */
const adminGet = () => {

  return new Promise<Admin>((resolve) => {

    dbPromise.then(db => {
      const store = db
        .transaction(['admin'], 'readonly')
        .objectStore('admin')

      const request = store.get('admin')
      request.onsuccess = () => {

        let admin: Admin = request.result
        if (!admin) {
          admin = {
            config: 'admin',
            langUrl: langUrlDefault,
            linkUrl: linkUrlDefault,
            backupUrl: '',
            file: '',
            token: ''
          }
        }
        resolve(admin)
      }
    })
  })
}

/**
 * The function writes the admin configuration to the indexeddb.
 */
const adminPut = async (admin: Admin) => {

  admin.langUrl = ensureEnd(admin.langUrl, '/')
  if (!admin.linkUrl) {
    admin.linkUrl = langUrlDefault
  } else {
    admin.linkUrl = ensureEnd(admin.linkUrl, '/')
  }

  const store = (await dbPromise)
    .transaction(['admin'], 'readwrite')
    .objectStore('admin')

  storePut(store, admin)
}

/**
 * The definition of a store with admin configurations.
 */
const createAdminStore = () => {

  //
  // Create an emtpy store, which has to be initialized.
  //
  const store = writable<Admin>()

  return {
    subscribe: store.subscribe,

    /**
     * The function initialises the admin store. Await the result before you 
     * can use the store.
     */
    init: async () => {
      const admin = await adminGet()
      store.set(admin)
      console.log('init admin', admin)
    },

    get: () => {
      return get(store)
    },

    put: async (admin: Admin) => {
      const result = new Result<void>()
      try {
        await adminPut(admin)
        store.set(admin)
        return result.setOk()

      } catch (e) {
        return result.setError(`Unable to store admin config - ${e}`)
      }
    }
  }
}

export const adminStore = createAdminStore()
