<script lang="ts">
  import { onMount } from 'svelte';
  import { viewStore } from '../stores/viewStore';
  import { questGetTag } from '../js/questModel';

  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';
  import QuestArrShow from './QuestArrShow.svelte';

  export let tag: string;
  export let topics: Topic[];

  let questions: Question[] = [];

  /**
   * On mounting the component the questions for the topic is loaded.
   */
  onMount(() => {
    questGetTag(topics, 30).then((topicQuests) => {
      questions = topicQuests;
    });
  });

  /**
   * Change the view. The topic for the next view.
   */
  const onClick = () => {
    viewStore.setView('TagShow', { tag: tag, topics: topics });
  };
</script>

<div class="card card-shadow content">
  <h4>Tag: {tag}</h4>

  <QuestArrShow {questions} />

  <div class="buttons">
    <button class="button" on:click={() => onClick()}>Back</button>
  </div>
</div>
