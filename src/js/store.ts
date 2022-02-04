/**
 * The function is called with a transaction for a store, that has an index
 * with a given name. It deletes all elements from the store that have an index
 * with the value.
 */
export const storeDeleteIndex = (tx: IDBTransaction, storeName: string, idxName: string, idxValue: string) => {

  return new Promise<void>((resolve, reject) => {

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
    request.onsuccess = (e) => {
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
 * Simple wrapper that deletes an object by its id.
 */
export const storeDel = (store: IDBObjectStore, id: IDBValidKey) => {
  const request = store.delete(id)

  request.onsuccess = (e) => {
    console.log('Store:', store.name, 'delete:', id)
  }

  request.onerror = (e) => {
    console.log('Store:', store.name, 'delete:', id, 'error', e)
  }
}

/**
 * Simple wrapper that inserts an object.
 */
export const storeAdd = (store: IDBObjectStore, obj: any) => {
  const request = store.add(obj)

  request.onsuccess = (e) => {
    console.log('Store:', store.name, 'add:', obj)
  }

  request.onerror = (e) => {
    console.log('Store:', store.name, 'add:', obj, 'error', e)
  }
}

/**
 * Simple wrapper that updates an object.
 */
export const storePut = (store: IDBObjectStore, obj: any) => {
  const request = store.put(obj)

  request.onsuccess = (e) => {
    console.log('Store:', store.name, 'put:', obj)
  }

  request.onerror = (e) => {
    console.log('Store:', store.name, 'put:', obj, 'error', e)
  }
}