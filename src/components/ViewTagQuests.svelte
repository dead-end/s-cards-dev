<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import QuestArrShow from './QuestArrShow.svelte';
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  export let tag: string;
  export let topics: Topic[];
  export let questions: Question[] = [];

  /**
   *
   */
  const onClick = () => {
    viewStore.setView('ViewTagInfo', {
      tag: tag,
      topics: topics,
      questions: questions,
    });
  };
</script>

<div class="card card-shadow content">
  <h4>Tag: {tag}</h4>

  <QuestArrShow {questions} />

  <div class="buttons">
    <button class="button" on:click={() => onClick()}>Back</button>
  </div>
</div>
