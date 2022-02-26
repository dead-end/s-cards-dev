import { writable } from 'svelte/store'
import { db } from '../js/db'
import { storePut } from '../js/store'

const langUrlDefault = 'https://api.github.com/repos/dead-end/cards-russian/contents/'

/**
 * The admin configuration. The config property is the key for the store. The 
 * value is 'admin'.
 */
export interface Admin {
    config: string,
    langUrl: string,
    token: string,
}

/**
 * The function reads the admin object from the indexeddb.
 */
const adminGet = () => {

    return new Promise<Admin>((resolve, reject) => {

        const store = db
            .transaction(['admin'], 'readonly')
            .objectStore('admin')

        const request = store.get('admin')
        request.onsuccess = (e) => {

            let admin: Admin = request.result
            if (!admin) {
                admin = {
                    config: 'admin',
                    langUrl: langUrlDefault,
                    token: ''
                }
            }

            console.log('Store:', store.name, 'langUrl:', admin.langUrl)

            resolve(admin)
        }
    })
}

/**
 * The function writes the admin configuration to the indexeddb.
 */
const adminPut = (admin: Admin) => {
    const store = db.transaction(['admin'], 'readwrite').objectStore('admin')
    storePut(store, admin)
}

/**
 * Create the svelte store for the admin configurations.
 */
const createAdminStore = () => {
    //
    // Initialize the store with an empty object.
    //
    const { subscribe, set, update } = writable<Admin>()

    return {
        subscribe,

        /**
         * The method updates the configuration.
         */
        setAdmin: (admin: Admin) => {
            adminPut(admin)
            set(admin)
        },

        /**
         * The initialization has to wait until we are sure that the db exists.
         */
        initAdmin: async () => {
            return adminGet().then(a => set(a))
        }
    }
}

export const adminStore = createAdminStore()