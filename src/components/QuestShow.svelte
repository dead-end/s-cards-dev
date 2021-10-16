<script>
  import { onMount } from 'svelte';

  import { viewStore } from '../stores/viewStore';

  import { dbqGetAll, dbqUpdate, questOnAnswer } from '../js/dbQuest';
  import { shuffleArr } from '../js/utils';

  export let topic;

  let statistic = [];

  let hideAnswer = true;

  let quests = [];

  let unlearned = [];

  let quest = {};

  const handleAnswer = (isCorrect) => {
    questOnAnswer(quest, isCorrect);

    dbqUpdate(quest).then(() => {
      if (quest.current < 3) {
        unlearned.push(quest);
      }

      if (unlearned.length === 0) {
        onStop();
      }

      updateStatistic(quests);
      next();
      hideAnswer = !hideAnswer;
    });
  };

  /**
   *
   */
  const updateStatistic = (arr) => {
    const s = [0, 0, 0, 0];
    arr.forEach((a) => {
      s[a.current]++;
    });
    statistic = s;
  };

  const next = () => {
    quest = unlearned.shift();
    console.log('next', quest);
  };

  /**
   * Callback function for the mount event.
   */
  onMount(() => {
    dbqGetAll(topic).then((arr) => {
      quests = arr;
      unlearned = quests.filter((q) => q.current < 3);
      shuffleArr(unlearned);
      updateStatistic(quests);
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

  <!-- Questions -->
  <table class="table hide-md">
    <tr>
      <td>No correct Answers</td>
      <td>{statistic[0]}</td>
    </tr>
    <tr>
      <td>One correct Answer</td>
      <td>{statistic[1]}</td>
    </tr>
    <tr>
      <td>Two correct Answers</td>
      <td>{statistic[2]}</td>
    </tr>
    <tr>
      <td>Learned</td>
      <td>{statistic[3]}</td>
    </tr>
  </table>

  <div class="grid grid-2">
    <div>
      <div class="is-flex-spread">
        <h5>Question <span id="qa-no" /></h5>
        <span class="h6">
          (<span class="is-text-success">Total: {quest.total}</span> /
          <span class="is-text-danger">Failed: {quest.failed}</span>
          <span>{quest.ratio}</span>)
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
