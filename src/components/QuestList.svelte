<script>
  import { viewStore } from '../stores/viewStore';
  import { onMount } from 'svelte';

  import { dbqGetAll } from '../js/dbQuest';
  import { createRepeatToggle } from '../js/utils';

  export let topic;

  let questions = [];

  onMount(() => {
    dbqGetAll(topic).then((t) => {
      questions = t;
      console.log(questions);
    });
  });

  const onClick = (topic) => {
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
      <div class="card listing-column {repeatToggle()}">
        <div class="content">
          <p class="listing-quest">{question.quest}</p>
        </div>
      </div>
      <div class="card listing-column {repeatToggle()}">
        <div class="content">
          <p class="listing-answer">{question.answer}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="buttons">
    <button class="button" on:click={() => onClick(topic)}>Back</button>
  </div>
</div>
