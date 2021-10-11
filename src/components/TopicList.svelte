<script>
  import { onMount } from 'svelte';

  import { dbtGetAll } from '../js/dbTopics';

  import Topic from './Topic.svelte';

  let topics = [];

  onMount(() => {
    dbtGetAll().then((t) => {
      topics = t;
    });
  });
</script>

<div class="grid grid-4" id="pool-list-body">
  {#each topics as topic}
    <Topic {topic} />
  {/each}
</div>
