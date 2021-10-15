import { writable } from 'svelte/store';

const createViewStore = () => {
  const { subscribe, set, update } = writable({});

  return {
    views: {},
    subscribe,

    setView: (id, props) => {
      const view = viewStore.views[id];
      view.props = props;
      set(view);
    },
  };
};

export const viewStore = createViewStore();
