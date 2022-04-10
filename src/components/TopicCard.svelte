<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import TopicInfo from './TopicInfo.svelte';
  import type { Topic } from '../js/topicModel';

  export let topic: Topic;

  /**
   * Show the topic.
   */
  const onClick = (topic: Topic) => {
    viewStore.setView('ViewTopicInfo', { topic: topic });
  };
</script>

<div class="card card-shadow content" id={topic.file}>
  <TopicInfo {topic} details={false} />
  <div class="is-floating">
    <button class="button" on:click={() => onClick(topic)}>Show</button>
  </div>
</div>
