<script lang="ts">
  import { onMount } from 'svelte';
  import QuestArrShow from './QuestArrShow.svelte';
  import { viewStore } from '../stores/viewStore';
  import { questGetAll } from '../js/questModel';

  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  export let topic: Topic;

  let questions: Question[] = [];

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
    viewStore.setView('TopicShow', { topic: topic });
  };
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>

  <QuestArrShow {questions} />

  <div class="buttons">
    <button class="button" on:click={() => onClick(topic)}>Back</button>
  </div>
</div>
