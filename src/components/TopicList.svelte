<script>
  import { onMount } from 'svelte';

  import { dbtGetAll } from '../js/dbTopics';

  import TopicCard from './TopicCard.svelte';

  let topics = [];

  onMount(() => {
    dbtGetAll().then((t) => {
      topics = t;
    });
  });
</script>

<div class="grid grid-4" id="pool-list-body">
  {#each topics as topic}
    <TopicCard {topic} />
  {/each}
</div>
