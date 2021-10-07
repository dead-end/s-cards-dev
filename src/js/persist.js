import { hashArr, hashStr } from './hash';
import { fetchJson } from './fetch';

let db;

/**
 * Simple error callback function.
 *
 * @param {*} event
 */
const onError = (e) => {
  console.error(e.target.error);
};

/**
 * The function adds an object to the store.
 *
 * @param {*} store
 * @param {*} topic
 */
const storeAdd = (store, obj) => {
  store.add(obj).onsuccess = (e) => {
    console.log('Added: ' + e.target.result + ' to: ' + store.name);
  };
};

/**
 * The function removes an object from the store.
 *
 * @param {*} store
 * @param {*} key
 */
const storeDelete = (store, key) => {
  store.delete(key).onsuccess = (e) => {
    console.log('Deleted: ' + key + ' from: ' + store.name);
  };
};

/**
 * The function create the object stores and indices.
 *
 * @param {*} e
 */
const onUpgradeNeeded = (e) => {
  if (e.oldVersion < 1) {
    db = e.target.result;

    //
    // Create topics store
    //
    const storeTopics = db.createObjectStore('topics', {
      keyPath: 'file',
    });
    storeTopics.createIndex('hash', 'hash', { unique: false });

    //
    // Create questions store
    //
    const storeQuest = db.createObjectStore('questions', {
      keyPath: 'id',
    });
    storeQuest.createIndex('file', 'file', { unique: false });
    storeQuest.createIndex('hash', 'hash', { unique: false });

    //
    // Create progress store
    //
    const storeProgress = db.createObjectStore('progress', {
      keyPath: 'id',
    });
    storeProgress.createIndex('file', 'file', { unique: false });

    //
    // Create config store
    //
    const storeConfig = db.createObjectStore('config', {
      keyPath: 'key',
    });

    storeConfig.transaction.oncomplete = (e) => {
      console.log('Upgrade completed!');
    };
  }
};

/**
 *
 * @param {*} store
 * @param {*} storeKeys
 * @param {*} jsonArr
 * @param {*} getId
 */
const syncJsonDb = (store, storeKeys, jsonArr, getId) => {
  const jsonKeys = jsonArr.map((ja) => {
    return getId(ja);
  });

  jsonArr.forEach((jsonItem) => {
    if (!storeKeys.includes(getId(jsonItem))) {
      storeAdd(store, jsonItem);
    }
  });

  storeKeys.forEach((storeKey) => {
    if (!jsonKeys.includes(storeKey)) {
      storeDelete(store, storeKey);
    }
  });
};

/**
 *
 * @param {*} topicsJson
 */
const syncTopics = (topicsJson) => {
  console.log(topicsJson);
  //
  // Add the hash to the topics.
  //
  topicsJson.forEach((topic) => {
    topic.hash = hashTopic(topic);
  });

  const topicStore = db
    .transaction(['topics'], 'readwrite')
    .objectStore('topics');

  topicStore.getAll().onsuccess = (e) => {
    const topicsStore = e.target.result;
    const keysStore = arrGetProps(topicsStore, 'file');
    const keysJson = arrGetProps(topicsJson, 'file');

    topicsJson.forEach((jsonItem) => {
      if (!keysStore.includes(jsonItem.file)) {
        storeAdd(topicStore, jsonItem);
      }
    });

    topicsStore.forEach((storeKey) => {
      if (!keysJson.includes(storeKey)) {
        storeDelete(topicStore, storeKey);
      }
    });
  };
};

/**
 *
 * @param {*} questsJson
 * @param {*} file
 */
const syncQuestProgress = (questsJson, file) => {
  //
  // Get a transaction for the quest and progress store.
  //
  const tx = db.transaction(['questions', 'progress'], 'readwrite');

  //
  // Sync the quest store with the json.
  //
  const questStore = tx.objectStore('questions');
  questStore.index('file').getAllKeys(file).onsuccess = (e) => {
    syncJsonDb(questStore, e.target.result, questsJson, (item) => {
      return item.hash;
    });
  };

  //
  // Create a syntetic progess array with default values.
  //
  const progressJson = questsJson.map((q) => {
    return {
      hash: q.hash,
      file: q.file,
    };
  });

  //
  // Sync the procress store with the json.
  //
  const progressStore = tx.objectStore('progress');
  progressStore.index('file').getAllKeys(file).onsuccess = (e) => {
    syncJsonDb(progressStore, e.target.result, progressJson, (item) => {
      return item.hash;
    });
  };
};

/**
 *
 * @param {*} quest
 * @returns
 */
const hashQuest = (quest) => {
  let hash = 0;

  hash = hashStr(quest.file, hash);
  hash = hashArr(quest.quest, hash);
  hash = hashArr(quest.answer, hash);

  return hash;
};

/**
 *
 * @param {*} topic
 * @returns
 */
const hashTopic = (topic) => {
  let hash = 0;

  hash = hashStr(topic.file, hash);
  hash = hashStr(topic.title, hash);
  hash = hashStr(topic.desc, hash);

  return hash;
};

/**
 *
 * @param {*} arr
 * @param {*} prop
 * @returns
 */
const arrGetProps = (arr, prop) => {
  return arr.map((a) => {
    return a[prop];
  });
};

/**
 *
 */
export const initDB = () => {
  const request = indexedDB.open('s-card', 1);

  request.onupgradeneeded = onUpgradeNeeded;

  request.onerror = onError;

  request.onsuccess = (e) => {
    db = e.target.result;
    db.onerror = onError;
    console.log('db init success!');

    updateTopics();
  };
};

/**
 *
 * @param {*} file
 */
export const loadQuestions = (file) => {
  console.log(file);
  fetchJson(
    file,

    (json) => {
      json.forEach((quest) => {
        quest.file = file;
        quest.hash = hashQuest(quest);
      });

      syncQuestProgress(json, file);
    }
  );
};

// -----------------------------

const topicsLastModifiedStore = () => {
  return new Promise((resolve, reject) => {
    db
      .transaction(['config'], 'readonly')
      .objectStore('config')
      .get('topics-last-modified').onsuccess = (e) => {
      resolve(e.target.result.value);
    };
  });
};

const setTopicsLastModified = (lm) => {
  console.log('jjooooo');
  db
    .transaction(['config'], 'readwrite')
    .objectStore('config')
    .put({ key: 'topics-last-modified', value: lm }).onsuccess = () => {
    console.log('update: topics-last-modified with: ' + lm);
  };
};

const updateTopics = async () => {
  const tlmStore = topicsLastModifiedStore();
  const tlmHead = fetch('data/topics.json', { method: 'HEAD' }).then(
    (r) => new Date(r.headers.get('Last-Modified'))
  );

  const values = await Promise.all([tlmStore, tlmHead]);
  const storeLm = values[0];
  const headLm = values[1];

  console.log('store', storeLm);
  console.log('head', headLm);

  if (!storeLm || storeLm < headLm) {
    fetch('data/topics.json')
      .then((response) => response.json())
      .then((json) => {
        syncTopics(json);
        setTopicsLastModified(headLm);
      });
  }
};
