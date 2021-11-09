// TODO: TS OK => remove TODO
import { writable } from 'svelte/store';

/**
 * The function creates a store object for errors. The errors are maintained in
 * an array.
 */
const createErrorStore = () => {
  //
  // Initialize the store with an empty array.
  //
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,

    /**
     * Add a new error to the error array.
     */
    addError: (error: string) => {
      console.log('Added error:', error);

      update(errors => {
        errors.push(error)
        return errors;
      });
    },

    /**
     * Reset the store with an empty array.
     */
    resetErrors: () => {
      set([]);
    },
  };
};

export const errorStore = createErrorStore();
