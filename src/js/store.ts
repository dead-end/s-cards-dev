// TODO: TS OK => remove TODO
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
    const store = tx.objectStore(storeName);

    //
    // Get all keys for items that have the given value for the index.
    //
    const request = store.index(idxName).getAllKeys(idxValue);

    //
    // Get an array with the keys of the matching objects,
    //
    request.onsuccess = (e) => {
      const keys = request.result;

      //
      // Delete all objects with their keys,
      //
      keys.forEach((key) => {
        store.delete(key).onsuccess = (e) => {
          console.log('Store: ', store.name, ' deleted: ', key);
        };
      });

      //
      // Resolve after all elements are deleted.
      //
      resolve();
    };
  });
};

/**
 * The function is called with a transaction for a store with a given name and
 * an array of objects. All elements of the array are added to the store.
 */
export const storeAddAll = (tx: IDBTransaction, storeName: string, arr: Array<Object>) => {
  return new Promise<void>((resolve, reject) => {
    //
    // Get the store from the transaction.
    //
    const store = tx.objectStore(storeName);

    arr.forEach((item) => {
      store.add(item).onsuccess = (e) => {
        console.log('Store: ', store.name, '  added: ', item);
      };
    });

    //
    // Resolve after all elements are added.
    //
    resolve();
  });
};
