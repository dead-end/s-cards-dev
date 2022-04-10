<script lang="ts">
  import { onMount } from 'svelte';
  import QuestArrShow from './QuestArrShow.svelte';
  import { viewStore } from '../stores/viewStore';
  import { questGetAll } from '../js/questModel';

  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  export let topic: Topic;

  let questions: Question[] = [];

  let details: string = '0';

  /**
   * On mounting the component the questions for the topic is loaded.
   */
  onMount(() => {
    questGetAll(topic).then((topicQuests) => {
      questions = topicQuests;
    });
  });

  /**
   * Change the view. The topic for the next view.
   */
  const onClick = (topic: Topic) => {
    viewStore.setView('ViewTopicInfo', { topic: topic });
  };
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>

  <div class="block">
    <label for="details-select">Details</label>
    <select id="details-select" bind:value={details}>
      <option value="0">Simple</option>
      <option value="1">Progress</option>
      <option value="2">ID's</option>
    </select>
  </div>

  <QuestArrShow {questions} details={parseInt(details)} />

  <div class="is-floating">
    <button class="button" on:click={() => onClick(topic)}>Back</button>
  </div>
</div>
