<script>
  import { onMount } from 'svelte';
  import { viewStore } from '../stores/viewStore';
  import QuestStatistic from './QuestStatistic.svelte';
  import {
    questGetAll,
    questPersist,
    questOnAnswer,
    questGetStatistics,
  } from '../js/questModel';
  import { shuffleArr } from '../js/utils';

  export let topic;

  let statistic = [];

  let hideAnswer = true;

  let quests = [];

  let unlearned = [];

  let quest = {};

  const handleAnswer = (isCorrect) => {
    questOnAnswer(quest, isCorrect);

    questPersist(quest).then(() => {
      if (quest.current < 3) {
        unlearned.push(quest);
      }

      if (unlearned.length === 0) {
        onStop();
      }

      statistic = questGetStatistics(quests);
      next();
      hideAnswer = !hideAnswer;
    });
  };

  const next = () => {
    quest = unlearned.shift();
    console.log('next', quest);
  };

  /**
   * Callback function for the mount event.
   */
  onMount(() => {
    questGetAll(topic).then((arr) => {
      quests = arr;
      unlearned = quests.filter((q) => q.current < 3);
      shuffleArr(unlearned);
      statistic = questGetStatistics(quests);
      next();
    });
  });

  /**
   * Callback function for the stop button.
   */
  const onStop = () => {
    viewStore.setView('TopicList');
  };

  /**
   * Callback function for the show button.
   */
  const onShow = () => {
    hideAnswer = !hideAnswer;
  };

  const onCorrect = () => {
    handleAnswer(true);
  };

  const onWrong = () => {
    handleAnswer(false);
  };
</script>

<div class="card card-shadow content" id="cont-qa">
  <h4>{topic.title}</h4>

  <QuestStatistic {statistic} />
  <div class="grid grid-2">
    <div>
      <div class="is-flex-spread">
        <h5>Question <span id="qa-no" /></h5>
        <span class="h6">
          (Progress: <span class="is-text-success">{quest.current}</span> /
          <span class="is-text-danger">{quest.failed}</span>
          Total: <span class="is-text-success">{quest.total}</span> /
          <span class="is-text-danger">{quest.ratio}</span>)
        </span>
      </div>

      <div class="card content is-primary">
        <p>{quest.quest}</p>
      </div>
    </div>

    <div hidden={hideAnswer}>
      <h5>Answer</h5>
      <div class="card content is-info">
        <p>{quest.answer}</p>
      </div>
    </div>
  </div>

  <!-- Buttons related to questions and answers -->
  <div class="buttons">
    <button class="button" hidden={!hideAnswer} on:click={onShow}>Show</button>
    <button class="button is-success" hidden={hideAnswer} on:click={onCorrect}
      >Correct</button
    >
    <button class="button is-danger" hidden={hideAnswer} on:click={onWrong}
      >Wrong</button
    >
    <button class="button" on:click={onStop}>Stop</button>
  </div>
</div>
