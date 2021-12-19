<script lang="ts">
  import { onMount } from 'svelte';
  import QuestProgress from './QuestProgress.svelte';
  import { viewStore } from '../stores/viewStore';
  import { questGetAll } from '../js/questModel';
  import { createRepeatToggle } from '../js/utils';
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  import Markdown from '../js/Markdown';
  export let topic: Topic;

  let questions: Question[] = [];

  const md = new Markdown();

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

  //
  // The function toogles the values after 2 calls.
  //
  const repeatToggle = createRepeatToggle(2, 'is-primary', 'is-info');
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>
  <div class="grid grid-2">
    {#each questions as question}
      <div class="is-flex-spread grid-full">
        <div class="h6">Id: {question.id}</div>
        <QuestProgress quest={question} />
      </div>

      <div class="card {repeatToggle()}">
        <div class="content">
          <p>{@html md.toHtml(question.quest)}</p>
        </div>
      </div>
      <div class="card {repeatToggle()}">
        <div class="content">
          <p>{@html md.toHtml(question.answer)}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="buttons">
    <button class="button" on:click={() => onClick(topic)}>Back</button>
  </div>
</div>
