<script lang="ts">
  import { onMount } from 'svelte';
  import { viewStore } from '../stores/viewStore';
  import QuestStatistic from './QuestStatistic.svelte';
  import QuestProgress from './QuestProgress.svelte';
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
    viewStore.setView('TopicList', { id: topic.file });
  };
</script>

{#if quest}
  <div class="card card-shadow content">
    <h4>{topic.title}</h4>

    <QuestStatistic {statistic} />

    <div class="grid grid-2">
      <div>
        <div class="is-flex-spread block">
          <div class="h5">Question: {quest.id}</div>
          <QuestProgress {quest} />
        </div>

        <div class="card content is-primary">
          <p>{@html md.toHtml(quest.quest)}</p>
        </div>
      </div>

      <div hidden={hideAnswer}>
        <h5>Answer</h5>
        <div class="card content is-info">
          <p>{@html md.toHtml(quest.answer)}</p>
          {#if topic.details}
            <p>{@html md.toHtml(topic.details)}</p>
          {/if}
        </div>
      </div>
    </div>

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
