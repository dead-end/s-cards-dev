<script>
  import { onMount } from 'svelte';
  import { TopicStore } from './stores/topicStore';
  import Topic from './components/Topic.svelte';

  onMount(TopicStore.load);
</script>

<div class="grid grid-4" id="pool-list-body">
  {#each $TopicStore as topic}
    <Topic {topic} />
  {/each}
</div>
