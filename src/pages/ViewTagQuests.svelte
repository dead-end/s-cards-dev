<script lang="ts">
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  import { viewStore } from '../stores/viewStore';

  import QuestArrShow from '../components/QuestArrShow.svelte';

  export let tag: string;
  export let topics: Topic[];
  export let questions: Question[] = [];

  const onBack = () => {
    viewStore.setView('ViewTagInfo', {
      tag: tag,
      topics: topics,
      questions: questions
    });
  };
</script>

<div class="card card-shadow content">
  <h4>Tag: {tag}</h4>

  <QuestArrShow {questions} />

  <div class="is-floating">
    <button class="button" on:click={() => onBack()}>Back</button>
  </div>
</div>
