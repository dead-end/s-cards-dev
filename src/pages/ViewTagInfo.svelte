<script lang="ts">
  import type { Question } from '../js/questModel';
  import type { Topic } from '../js/topicModel';
  import { questGetTag, questSetProgressArr } from '../js/questModel';
  import { getErrorMessage, ensureMinMax } from '../js/utils';

  import { viewStore } from '../stores/viewStore';
  import { errorStore } from '../stores/errorStore';

  export let tag: string;
  export let topics: Topic[];
  export let questions: Question[] | void;

  let loadQuests = '30';
  let fraction = 0.8;
  let loaded = false;

  let correct: -1;

  /**
   * The callback funciton to show the listing view.
   */
  const onListing = () => {
    viewStore.setView('ViewTagQuests', {
      tag: tag,
      topics: topics,
      questions: questions
    });
  };

  /**
   * The callback functoin to go back.
   */
  const onBack = () => {
    viewStore.setView('ViewTopicList');
  };

  const onStart = () => {
    viewStore.setView('ViewQuestAnswer', {
      tag: tag,
      topics: topics,
      questions: questions
    });
  };

  const onSelect = (e: Event) => {
    //
    // Ensure that we have questions.
    //
    if (!questions) {
      return;
    }
    const target = e.target as HTMLSelectElement;
    //
    // Set the number of correct answers.
    //
    questSetProgressArr(questions, target.selectedIndex - 1);

    //
    // Set the index to 0 to restore the orignal state.
    //
    target.selectedIndex = 0;
  };

  /**
   * Callback function for the mount event.
   */
  const onLoad = async () => {
    try {
      const max = loadQuests === 'all' ? -1 : 30;
      questions = await questGetTag(topics, max, fraction);
      loaded = true;
    } catch (error) {
      errorStore.addError('ViewTagInfo: ' + getErrorMessage(error));
    }
  };

  const onChange = () => {
    fraction = ensureMinMax(fraction, 0.2, 1);
  };
</script>

<div class="card card-shadow content">
  <div>
    <div class="is-text-left">
      <h4>Tag: {tag}</h4>
      <p>Files incluging the tag:</p>
      <ul>
        {#each topics as topic}
          <li>{topic.title}</li>
        {/each}
      </ul>
    </div>
  </div>

  {#if !loaded}
    <div class="is-floating">
      <label for="load-quests">Load Questions</label>
      <select id="load-quests" bind:value={loadQuests}>
        <option value="30">30</option>
        <option value="all">All</option>
      </select>
    </div>

    <div class="is-floating">
      <label for="relevant">Fraction</label>
      <input
        id="relevant"
        type="number"
        min="0.2"
        max="1"
        step="0.2"
        bind:value={fraction}
        on:input={onChange}
      />
    </div>
  {:else}
    <div class="is-floating">
      <label for="sf-set">Number of correct answers</label>
      <select id="sf-set" bind:value={correct} on:change={onSelect}>
        <option value="-1">-- Select --</option>
        <option value="0">Set 0</option>
        <option value="1">Set 1</option>
        <option value="2">Set 2</option>
      </select>
    </div>
  {/if}

  <div class="is-floating">
    <button class="button" on:click={onBack}>Back</button>
    {#if loaded}
      <button class="button" on:click={onListing}>Listing</button>
      <button class="button" on:click={onStart}>Start</button>
    {:else}
      <button class="button" on:click={onLoad}>Load</button>
    {/if}
  </div>
</div>
