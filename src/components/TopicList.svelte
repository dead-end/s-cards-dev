<script lang="ts">
  import { onMount } from 'svelte';
  import { topicGetAll } from '../js/topicModel';
  import TopicCard from './TopicCard.svelte';
  import type { Topic } from '../js/topicModel';

  let topics: Array<Topic> = [];

  /**
   * On mount, get all the topics from the store.
   */
  onMount(() => {
    topicGetAll().then((t) => {
      topics = t;
    });
  });
</script>

<div class="grid grid-4">
  {#each topics as topic}
    <TopicCard {topic} />
  {/each}
</div>
