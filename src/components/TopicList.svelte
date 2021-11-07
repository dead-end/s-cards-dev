<script lang="ts">
  import { onMount } from 'svelte';

  import { topicGetAll } from '../js/topicModel';
  import type { Topic } from '../js/topicModel';

  import TopicCard from './TopicCard.svelte';

  let topics: Array<Topic> = [];

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
