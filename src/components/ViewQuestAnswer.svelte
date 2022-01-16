<script lang="ts">
  import { onMount } from 'svelte';
  import { viewStore } from '../stores/viewStore';
  import QuestStatistic from './QuestStatistic.svelte';
  import { shuffleArr } from '../js/utils';
  import Markdown from '../js/Markdown';
  import {
    questGetAll,
    questPersist,
    questOnAnswer,
    questGetStatistics,
  } from '../js/questModel';

  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';
  import QuestAnswer from './QuestAnswer.svelte';
  import { topicUpdate } from '../js/topicModel';

  export let topic: Topic;

  const md = new Markdown();

  let statistic: number[];

  let hideAnswer = true;

  let quests: Question[];

  let unlearned: Question[];

  let quest: Question;

  const handleAnswer = (isCorrect?: boolean) => {
    //
    // On skip, we do not update the statistik and go to the next.
    //
    if (typeof isCorrect === 'undefined') {
      unlearned.push(quest);
      next();
      return;
    }

    questOnAnswer(quest, isCorrect);

    questPersist(quest).then(() => {
      if (quest.progress < 3) {
        unlearned.push(quest);
      }

      if (unlearned.length === 0) {
        onStop();
      }

      next();
    });
  };

  const next = () => {
    quest = unlearned.shift();
    console.log('next', quest);
    statistic = questGetStatistics(quests);
    hideAnswer = true;
  };

  /**
   * Callback function for the mount event.
   */
  onMount(() => {
    questGetAll(topic).then((arr) => {
      quests = arr;
      unlearned = quests.filter((q) => q.progress < 3);
      shuffleArr(unlearned);
      next();
    });
  });

  /**
   * Callback function for the stop button.
   */
  const onStop = () => {
    topic.lastLearned = new Date();
    topicUpdate(topic);
    viewStore.setView('ViewTopicList', { id: topic.file });
  };
</script>

{#if quest}
  <div class="card card-shadow content">
    <h4>{topic.title}</h4>

    <QuestStatistic {statistic} />

    <QuestAnswer {topic} {quest} {hideAnswer} />

    <!-- Buttons related to questions and answers -->
    <div class="buttons">
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
