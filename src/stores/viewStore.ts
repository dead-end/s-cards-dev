import { writable } from 'svelte/store'

/**
 * The interface defines a view component.
 */
export interface View {
  //
  // The component is a class defined by svelte.
  //
  component: any
  //
  // The properties used by the view, which are optional.
  //
  props?: object
}

/**
 * The function creates the view store.
 */
const createViewStore = () => {
  //
  // Initialize the store with an empty object.
  //
  const { subscribe, set } = writable<View>({ component: '' })

  return {
    views: {} as Record<string, View>,

    subscribe,

    setView: (id: string, props?: object) => {
      const view = viewStore.views[id]
      view.props = props
      set(view)
    },
  }
}

export const viewStore = createViewStore()
