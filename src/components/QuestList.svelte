<script>
  // TODO:  lang="ts"
  // TODO: listing-column, isting-quest, isting-answer does not exist.

  import { onMount } from 'svelte';
  import { viewStore } from '../stores/viewStore';
  import { questGetAll } from '../js/questModel';
  import { createRepeatToggle } from '../js/utils';

  export let topic;

  let questions = [];

  /**
   * On mounting the component the questions for the topic is loaded.
   */
  onMount(() => {
    questGetAll(topic).then((topicQuests) => {
      questions = topicQuests;
    });
  });

  /**
   * Change the view.
   *
   * @param topic The topic for the next view.
   */
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
      <div class="is-flex-spread grid-full">
        <div class="h5">{question.id}</div>
        {#if question.total != 0}
          <span class="h6">
            ( Total: <span class="is-text-success">{question.total}</span> /
            <span class="is-text-danger">{question.ratio}</span>)
          </span>
        {/if}
      </div>

      <div class="card {repeatToggle()}">
        <div class="content">
          <p>{question.quest}</p>
        </div>
      </div>
      <div class="card {repeatToggle()}">
        <div class="content">
          <p>{question.answer}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="buttons">
    <button class="button" on:click={() => onClick(topic)}>Back</button>
  </div>
</div>
