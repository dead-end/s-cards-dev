import { db } from './db'
import { storeDel } from './store'

/**
 * The interface for the hash object that is persisted in the store.
 */
export interface Hash {
    file: string,
    value?: string,
    lastLoaded?: Date
}

/**
 * The function gets a Hash object from the store, for a given file. If the 
 * store does not contains a Hash object, a new is created.
 */
export const hashGet = (file: string) => {

    return new Promise<Hash>((resolve, reject) => {
        const store = db.transaction(['hash'], 'readonly').objectStore('hash')

        const request = store.get(file)

        request.onsuccess = (e) => {
            const hash: Hash = request.result ? request.result : { file: file }
            console.log('Store:', store.name, 'get:', hash)
            resolve(hash)
        }

        request.onerror = (e) => {
            console.log('Store:', store.name, 'get:', file, 'error', e)
            reject()
        }
    })
}

/**
 * The function puts a Hash object in the store.
 */
export const hashPut = (hash: Hash) => {

    return new Promise<void>((resolve, reject) => {
        const store = db.transaction(['hash'], 'readwrite').objectStore('hash')

        const request = store.put(hash)

        request.onsuccess = (e) => {
            console.log('Store:', store.name, 'put:', hash)
            resolve()
        }

        request.onerror = (e) => {
            console.log('Store:', store.name, 'put:', hash, 'error', e)
            reject()
        }
    })
}

/**
 * The function deletes a Hash object in the store.
 */
export const hashDelTx = (tx: IDBTransaction, file: string) => {
    const store = tx.objectStore('hash')
    storeDel(store, file)
}