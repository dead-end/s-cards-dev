/**
 * The function computes the hash value over a string with a given hash value.
 *
 * @param {*} str The string to be added to the hash.
 * @param {*} hash The old hash value.
 * @returns The function returns the new hash value.
 */
export const hashStr = (str, hash) => {
  if (!str || str.length == 0) return hash;

  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash;
};

/**
 * The function computes the hash value over an array with a given hash value.
 *
 * @param {*} arr An array of strings to be added to the hash.
 * @param {*} hash The old hash value.
 * @returns The function returns the new hash value.
 */
export const hashArr = (arr, hash) => {
  arr.forEach((a) => {
    hash = hashStr(a, hash);
  });

  return hash;
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
