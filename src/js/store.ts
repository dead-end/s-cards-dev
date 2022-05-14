import { errorStore } from "../stores/errorStore"

/**
 * The function is called with a transaction for a store, that has an index
 * with a given name. It deletes all elements from the store that have an index
 * with the value.
 */
export const storeDeleteIndex = (tx: IDBTransaction, storeName: string, idxName: string, idxValue: string) => {

  return new Promise<void>((resolve) => {

    //
    // Get the store from the transaction.
    //
    const store = tx.objectStore(storeName)

    //
    // Get all keys for items that have the given value for the index.
    //
    const request = store.index(idxName).getAllKeys(idxValue)

    //
    // Get an array with the keys of the matching objects,
    //
    request.onsuccess = () => {
      const keys = request.result

      //
      // Delete all objects with their keys,
      //
      keys.forEach((key) => {
        storeDel(store, key)
      })

      //
      // Resolve after all elements are deleted.
      //
      resolve()
    }
  })
}

/**
 * Simple wrapper that deletes an object by its id and returns a promise.
 */
export const storeDel = (store: IDBObjectStore, id: IDBValidKey) => {

  return new Promise<void>((resolve, reject) => {
    const request = store.delete(id)

    request.onsuccess = () => {
      console.log('Store:', store.name, 'delete:', id)
      resolve()
    }

    request.onerror = (e) => {
      errorStore.addError(`Store: ${store.name} delete: ${id} error: ${e}`)
      reject()
    }
  })
}

/**
 * Simple wrapper that inserts an object and returns a promise.
 */
export const storeAdd = (store: IDBObjectStore, obj: any) => {

  return new Promise<void>((resolve, reject) => {
    const request = store.add(obj)

    request.onsuccess = () => {
      console.log('Store:', store.name, 'add:', obj)
      resolve()
    }

    request.onerror = (e) => {
      errorStore.addError(`Store: ${store.name} add: ${obj} error: ${e}`)
      reject()
    }
  })
}

/**
 * Simple wrapper that updates an object and returns a promise.
 */
export const storePut = (store: IDBObjectStore, obj: any) => {

  return new Promise<void>((resolve, reject) => {
    const request = store.put(obj)

    request.onsuccess = () => {
      console.log('Store:', store.name, 'put:', obj)
      resolve()
    }

    request.onerror = (e) => {
      errorStore.addError(`Store: ${store.name} put: ${obj} error: ${e}`)
      reject()
    }
  })
}