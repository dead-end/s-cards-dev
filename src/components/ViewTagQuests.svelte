<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import QuestArrShow from './QuestArrShow.svelte';
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  export let tag: string;
  export let topics: Topic[];
  export let questions: Question[] = [];

  let details: string = '0';
  /**
   *
   */
  const onClick = () => {
    viewStore.setView('ViewTagInfo', {
      tag: tag,
      topics: topics,
      questions: questions
    });
  };
</script>

<div class="card card-shadow content">
  <h4>Tag: {tag}</h4>

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
    <button class="button" on:click={() => onClick()}>Back</button>
  </div>
</div>
