<script>
  import { onMount } from 'svelte';

  import { topicStore } from '../stores/topicStore';

  import Topic from './Topic.svelte';

  onMount(topicStore.load);
</script>

<div class="grid grid-4" id="pool-list-body">
  {#each $topicStore as topic}
    <Topic {topic} />
  {/each}
</div>
