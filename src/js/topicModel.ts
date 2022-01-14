import { db } from './db';
import { questRemoveFile } from './questModel';
import { arrToMap, arrIsEqual } from './utils';

/**
 * The interface defines a topic persisted in the database.
 */
export interface Topic {
  //
  // The file of the topic, which is the primary key for the database.
  //
  file: string,
  //
  // The title of the topic.
  //
  title: string,
  //
  // An array with tags assosiated with the topic.
  //
  tags: string[],
  //
  // A description of the topic.
  //
  desc: string,
  //
  // A detailed message, which will be displayed on all answers of the topic.
  //
  details?: string[],
  //
  // The date when the file was loaded the last time.
  //
  lastLoaded?: Date,
  //
  // The date when the user learned the last time.
  //
  lastLearned?: Date,
  //
  // A string value to identifiy if the file changes. Currently this is the
  // size.
  //
  hash?: string
}

/**
 * The function compares two topics, one from the json and one from the store.
 */
const topicNeedUpdate = (json: Topic, store: Topic) => {
  //
  // If the topic is not in the store, we have to persist it.
  //
  if (!store) {
    return true;
  }
  //
  // If the topic in the store has a last loaded date, we want to preserve it.
  //
  if (store.lastLoaded) {
    json.lastLoaded = store.lastLoaded;
  }
  //
  // If the topic in the store has a last learned date, we want to preserve it.
  //
  if (store.lastLearned) {
    json.lastLearned = store.lastLearned;
  }
  //
  // Compare the topic values that came from the topics file.
  //
  if (json.title !== store.title ||
    json.desc !== store.desc ||
    !arrIsEqual(json.tags, store.tags) ||
    !arrIsEqual(json.details, store.details)) {
    return true;
  }

  return false;
}

/**
 * The function gets all topics from the store. It returns a promise with an
 * array of topics.
 */
export const topicGetAll = () => {

  return new Promise<Array<Topic>>((resolve, reject) => {
    const store = db.transaction(['topics'], 'readonly').objectStore('topics');

    const request = store.getAll();

    request.onsuccess = (e) => {
      resolve(request.result);
    };
  });
};

/**
 * The function returns a sorted array of unique tags.
 */
export const topicsGetTags = (topics: Topic[]) => {

  const tags: string[] = [];
  //
  // Iterate over the topics, which contain an array of tags.
  //
  topics.forEach((topic) => {
    //
    // Iterate over the tags of the topic.
    //
    topic.tags.forEach((tag) => {
      //
      // Check if our tags array contains this tag
      //
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
  });

  return tags.sort();
}

/**
 * The function gets the hash value assosiated with the topic file from the
 * database.
 */
// TODO: maybe it is simpler to read the topic (getTopic()) and then use the
// property.
export const topicGetHash = (file: string) => {

  return new Promise<string>((resolve, reject) => {
    const store = db.transaction(['topics'], 'readonly').objectStore('topics');

    const request = store.get(file);

    request.onsuccess = (e) => {
      //
      // Get the topic object from the store. It is possible that the value is
      // undefined.
      //
      const hash: string = request.result.hash;
      console.log('Store:', store.name, 'get hash:', hash);

      resolve(hash);
    };
  });
};

/**
 * The function writes the hash value assosiated with the topic to the
 * database. If the hash changed, then the file was loaded, so the last loaded
 * value has to be set to the current time.
 */
export const topicSetHash = (tx: IDBTransaction, file: string, hash: string) => {

  const store = tx.objectStore('topics');
  const request = store.get(file);

  store.get(file).onsuccess = (e) => {
    //
    // Get the topic from the store and set the last modified date.
    //
    const topic: Topic = request.result;
    topic.hash = hash;
    topic.lastLoaded = new Date();
    //
    // Write the updated tpic to the store.
    //
    store.put(topic).onsuccess = () => {
      console.log('Store:', store.name, 'set hash:', topic);
    };
  };
};

/**
 * The function updated the last learned value, which is the current date.
 */
export const topicUpdateLastLearned = (file: string) => {

  const tx = db.transaction(['topics', 'questions'], 'readwrite');

  const store = tx.objectStore('topics');
  const request = store.get(file);

  store.get(file).onsuccess = (e) => {
    //
    // Get the topic from the store and set the last modified date.
    //
    const topic: Topic = request.result;
    topic.lastLearned = new Date();
    //
    // Write the updated tpic to the store.
    //
    store.put(topic).onsuccess = () => {
      console.log('Store:', store.name, 'update lastLearned:', topic);
    };
  };
};

// --------------------------

/**
 * The function is called with a json array that contains the topics. It
 * deletes all topics from the store, that are not contained in the json and
 * updates the rest.
 */
// TODO: Wrong place!! If file was removed, then the Question and process stores have to be also removed.
export const topicSync = (json: Array<Topic>) => {
  const tx = db.transaction(['topics', 'questions'], 'readwrite');
  const store = tx.objectStore('topics');

  const request = store.getAll();

  request.onsuccess = (e) => {
    //
    // Create a map with the topics and the file as the key.
    //
    const storeMap = arrToMap(request.result, 'file');
    //
    // Get an array with the files from the json array. The file is the key for
    // the topics in the store and has to be unique.
    //
    const jsonKeys = json.map((item) => item['file']);
    //
    // Delete the topics from the store that are not in the json array.
    //
    for (let storeKey of storeMap.keys()) {

      if (!jsonKeys.includes(storeKey)) {
        store.delete(storeKey).onsuccess = () => {
          console.log('Store:', store.name, 'deleted:', storeKey);
          //
          // Remove the questions for the file.
          //
          questRemoveFile(tx, storeKey);
        };
      }
    }

    //
    // Update the topics in the store.
    //
    json.forEach((jsonItem) => {
      //
      // If the topic from the store and from the server are different, we 
      // update the store. 
      //
      if (topicNeedUpdate(jsonItem, storeMap.get(jsonItem.file))) {
        store.put(jsonItem).onsuccess = (e) => {
          console.log('Store:', store.name, 'update:', jsonItem.file);
        };
      }
    });
  };
};
