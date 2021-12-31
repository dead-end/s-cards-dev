<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { topicGetAll } from '../js/topicModel';
  import TopicCard from './TopicCard.svelte';
  import type { Topic } from '../js/topicModel';

  //
  // Id to scroll the view to.
  //
  export let id: string | void = null;

  let topics: Array<Topic> = [];

  /**
   * On mount, get all the topics from the store.
   */
  onMount(() => {
    topicGetAll().then((t) => {
      topics = t;
    });
  });

  /**
   * The function is called after an update. An update can be an empty list.
   */
  afterUpdate(() => {
    if (id) {
      const elem = document.getElementById(id);
      if (elem) {
        elem.scrollIntoView();
        console.log('scroll to: ' + id);
      }
    }
  });
</script>

<div class="grid grid-4">
  {#each topics as topic}
    <TopicCard {topic} />
  {/each}
</div>
