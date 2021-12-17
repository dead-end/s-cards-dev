<script lang="ts">
  import { onMount } from 'svelte';
  import { viewStore } from '../stores/viewStore';
  import { arrPercentage } from '../js/utils';
  import TopicInfo from './TopicInfo.svelte';
  import { questGetStats } from '../js/questModel';
  import type { Topic } from '../js/topicModel';

  export let topic: Topic;

  let status = 0;
  let size = 0;

  /**
   * Show the topic.
   */
  const onClick = (topic: Topic) => {
    viewStore.setView('TopicShow', { topic: topic });
  };

  /**
   * On mount we compute the status and get the size of the topic.
   */
  onMount(() => {
    questGetStats(topic.file).then((arr) => {
      status = arrPercentage(arr, 3);
      size = arr.length;
    });
  });
</script>

<div class="card card-shadow content">
  <TopicInfo {topic} {status} {size} />
  <div class="buttons">
    <button class="button" on:click={() => onClick(topic)}>Show</button>
  </div>
</div>
