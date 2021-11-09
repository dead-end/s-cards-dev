// TODO: TS OK => remove TODO
import { writable } from 'svelte/store';

/**
 * The interface defines a view component.
 */
export interface View {
  //
  // The component is a class defined by svelte.
  //
  component: any;
  //
  // The properties used by the view, which are optional.
  //
  props?: Object;
}

/**
 * The function creates the view store.
 */
const createViewStore = () => {
  //
  // Initialize the store with an empty object.
  //
  const { subscribe, set, update } = writable<View>({ component: '' });

  return {
    views: {},
    subscribe,

    setView: (id: string, props?: Object) => {
      const view = viewStore.views[id];
      view.props = props;
      set(view);
    },
  };
};

export const viewStore = createViewStore();
