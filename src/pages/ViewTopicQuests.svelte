<script lang="ts">
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';
  import QuestArrShow from '../components/QuestArrShow.svelte';
  import { onMount } from 'svelte';
  import { questGetAll } from '../js/questModel';
  import { viewStore } from '../stores/viewStore';

  export let topic: Topic;
  export let details = false;

  let questions: Question[] = [];

  /**
   * Load the questions on mount.
   */
  onMount(() => {
    questGetAll(topic).then((topicQuests) => {
      questions = topicQuests;
    });
  });

  /**
   * Go to the topic list.
   */
  const onBack = (topic: Topic) => {
    viewStore.setView('ViewTopicInfo', { topic: topic });
  };

  /**
   * The function to go back after editing a question.
   */
  const goBackFct = () => {
    viewStore.setView('ViewTopicQuests', { topic: topic, details: true });
  };
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>

  {#if questions.length !== 0}
    <QuestArrShow {questions} {details} {goBackFct} />
  {/if}

  <div class="is-floating">
    <button class="button" on:click={() => onBack(topic)}>Back</button>
  </div>
</div>
