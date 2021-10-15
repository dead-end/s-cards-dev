/**
 * The function is called with a transaction for a store, that has an index
 * with a given name. It deletes all elements from the store that have an index
 * with the value.
 *
 * @param {IDBTransaction} tx Transaction
 * @param {String} storeName Name of the store.
 * @param {String} idxName Name of the index.
 * @param {String} idxValue Value of the index.
 * @returns A Promise.
 */
export const storeDeleteIndex = (tx, storeName, idxName, idxValue) => {
  return new Promise((resolve, reject) => {
    //
    // Get the store from the transaction.
    //
    const store = tx.objectStore(storeName);

    //
    // Get an array with the keys of the matching objects,
    //
    store.index(idxName).getAllKeys(idxValue).onsuccess = (e) => {
      const keys = e.target.result;

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
 *
 * @param {IDBTransaction} tx Transaction
 * @param {String} storeName Name of the store.
 * @param {Array} arr Array with the objects.
 * @returns The function returns a Promise.
 */
export const storeAddAll = (tx, storeName, arr) => {
  return new Promise((resolve, reject) => {
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
