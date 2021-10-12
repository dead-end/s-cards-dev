<script>
  import { viewStore } from '../stores/viewStore';
  import { onMount } from 'svelte';

  import { dbqGetAll } from '../js/dbQuest';

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

  let clazz = 'is-info';

  // TODO: does not work correct
  const toggleClazz = () => {
    if (clazz === 'is-primary') {
      clazz = 'is-info';
    } else {
      clazz = 'is-primary';
    }

    return clazz;
  };
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>
  <div class="grid grid-2">
    {#each questions as question}
      <div class="card listing-column {toggleClazz()}">
        <div class="content">
          <p class="listing-quest">{question.quest}</p>
        </div>
      </div>
      <div class="card listing-column {clazz}">
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
