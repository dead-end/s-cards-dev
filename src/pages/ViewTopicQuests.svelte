<script lang="ts">
  import { onMount } from 'svelte';

  import { questGetAll } from '../js/questModel';
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  import { viewStore } from '../stores/viewStore';

  import QuestArrShow from '../components/QuestArrShow.svelte';

  export let topic: Topic;

  let questions: Question[] = [];

  onMount(() => {
    questGetAll(topic).then((topicQuests) => {
      questions = topicQuests;
    });
  });

  const onBack = (topic: Topic) => {
    viewStore.setView('ViewTopicInfo', { topic: topic });
  };
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>

  {#if questions.length !== 0}
    <QuestArrShow {questions} />
  {/if}

  <div class="is-floating">
    <button class="button" on:click={() => onBack(topic)}>Back</button>
  </div>
</div>
