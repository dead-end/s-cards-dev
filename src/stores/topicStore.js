import { writable } from 'svelte/store';

function createTopicStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,

    load: async () => {
      const response = await fetch('data/topics.json');
      const topics = await response.json();
      set(topics);
    },
  };
}

export const topicStore = createTopicStore();
