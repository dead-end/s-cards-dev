import { writable } from 'svelte/store';

function createRegistryStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,

    load: async () => {
      const response = await fetch('data/registry.json');
      const registrations = await response.json();
      set(registrations);
    },
  };
}

export const RegistryStore = createRegistryStore();
