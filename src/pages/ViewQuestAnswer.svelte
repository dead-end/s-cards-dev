<script lang="ts">
  import { onMount } from 'svelte';

  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';
  import { topicUpdate } from '../js/topicModel';
  import { shuffleArr } from '../js/utils';
  import {
    questPersist,
    questOnAnswer,
    questGetStatistics
  } from '../js/questModel';

  import { viewStore } from '../stores/viewStore';

  import QuestStatistic from '../components/QuestStatistic.svelte';
  import QuestAnswer from '../components/QuestAnswer.svelte';

  export let tag: string | void;

  export let topics: Topic[];
  let topic: Topic;

  export let questions: Question[];
  let question: Question;

  let statistic: number[];

  let hideAnswer = true;

  let unlearned: Question[];

  const handleAnswer = (isCorrect?: boolean) => {
    //
    // On skip, we do not update the statistik and go to the next.
    //
    if (typeof isCorrect === 'undefined') {
      unlearned.push(question);
      next();
      return;
    }

    questOnAnswer(question, isCorrect);

    questPersist(question).then(() => {
      if (question.progress < 3) {
        unlearned.push(question);
      }

      if (unlearned.length === 0) {
        onStop();
      }

      next();
    });
  };

  /**
   * The function setup the view for the next question.
   */
  const next = () => {
    // TODO not best solution
    const q = unlearned.shift();
    if (!q) {
      return;
    }
    question = q;

    const t = topics.find((t) => t.file === question.file);
    if (!t) {
      return;
    }
    topic = t;
    /*
    question = unlearned.shift();
    topic = topics.find((t) => t.file === question.file);
    */
    statistic = questGetStatistics(questions);
    hideAnswer = true;
    console.log('next', question);
  };

  /**
   * Callback function for the mount event.
   */
  onMount(() => {
    unlearned = questions.filter((q) => q.progress < 3);
    shuffleArr(unlearned);
    next();
  });

  /**
   * Callback function for the stop button.
   */
  const onStop = async () => {
    if (tag) {
      viewStore.setView('ViewTopicList');
    } else {
      topic.lastLearned = new Date();
      await topicUpdate(topic);
      viewStore.setView('ViewTopicList', { id: topic.file });
    }
  };
</script>

{#if question}
  <div class="card card-shadow content">
    {#if tag}
      <h4>Tag: {tag}</h4>
      <h6>{topic.title}</h6>
    {:else}
      <h4>{topic.title}</h4>
    {/if}

    <QuestStatistic {statistic} />

    <QuestAnswer {topic} {question} {hideAnswer} />

    <!-- Buttons related to questions and answers -->
    <div class="is-floating">
      <button
        class="button"
        hidden={!hideAnswer}
        on:click={() => (hideAnswer = false)}>Show</button
      >
      <button
        class="button is-success"
        hidden={hideAnswer}
        on:click={() => handleAnswer(true)}>Correct</button
      >
      <button
        class="button is-danger"
        hidden={hideAnswer}
        on:click={() => handleAnswer(false)}>Wrong</button
      >
      <button
        class="button is-warning"
        hidden={hideAnswer}
        on:click={() => handleAnswer()}>Skip</button
      >
      <button class="button" on:click={onStop}>Stop</button>
    </div>
  </div>
{/if}
