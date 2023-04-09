import { dbPromise } from './db'
import { storeDel, storeGet, storeGetAll, storePut } from './store'

/**
 * The interface for the hash object that is persisted in the store.
 */
export interface Hash {
    file: string,
    value: string,
    lastLoaded: Date
}

/**
 * The function gets a Hash object from the store, for a given file. If the 
 * store does not contains a Hash object, a new is created.
 */
export const hashGet = async (file: string) => {

    const store = (await dbPromise)
        .transaction(['hash'], 'readonly')
        .objectStore('hash')

    return storeGet<Hash>(store, file)
}

/**
 * The function returns a list of all hashes as a promise.
 */
export const hashGetAll = async () => {

    const store = (await dbPromise)
        .transaction(['hash'], 'readonly')
        .objectStore('hash')

    return storeGetAll<Hash>(store)
}

/**
 * The function puts a Hash object in the store.
 */
export const hashPut = async (hash: Hash) => {

    const store = (await dbPromise)
        .transaction(['hash'], 'readwrite')
        .objectStore('hash')

    return storePut(store, hash)
}

/**
 * The function deletes a Hash object in the store.
 */
export const hashDel = async (file: string) => {
    const store = (await dbPromise)
        .transaction(['hash'], 'readwrite')
        .objectStore('hash')

    return storeDel(store, file)
}

/**
 * The function deletes a Hash object in the store.
 */
export const hashDelTx = (tx: IDBTransaction, file: string) => {
    const store = tx.objectStore('hash')
    return storeDel(store, file)
}