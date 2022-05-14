import { dbPromise } from './db'
import { storePut } from './store'

const langUrlDefault = 'https://api.github.com/repos/dead-end/cards-russian/contents/'

/**
 * The admin configuration. The config property is the key for the store. The 
 * value is 'admin'.
 */
export interface Admin {
    config: string,
    langUrl: string,
    backupUrl: string,
    file: string,
    token: string,
}

/**
 * The function reads the admin object from the indexeddb.
 */
export const adminGet = () => {

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
export const adminPut = async (admin: Admin) => {
    const store = (await dbPromise)
        .transaction(['admin'], 'readwrite')
        .objectStore('admin')
    storePut(store, admin)
}