<script lang="ts">
  import { loadQuestions } from '../js/persist';
  import { arrPercentage, arrAll } from '../js/utils';
  import { viewStore } from '../stores/viewStore';
  import { errorStore } from '../stores/errorStore';
  import { onMount } from 'svelte';
  import TopicInfo from './TopicInfo.svelte';
  import Markdown from '../js/Markdown';
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';
  import { questGetAll, questSetProgressArr } from '../js/questModel';

  export let topic: Topic;
  export let questions: Question[] | void = null;

  const md = new Markdown();

  //
  // Properties for the view.
  //
  let status = 0;
  let startDisabled = true;
  let size = 0;

  /**
   * The function updates the status of the questions.
   */
  const updateStatus = () => {
    //
    // If we do not have questions,
    //
    if (!questions) {
      return;
    }
    const arr = questions.map((q) => q.progress);
    status = arrPercentage(arr, 3);
    startDisabled = arrAll(arr, 3);
    size = arr.length;
  };

  /**
   * On mount we load the questions for the topic and then we update the
   * properties for this view.
   */
  onMount(async () => {
    try {
      if (!questions) {
        // TODO: topic.lastLoaded is set inside the function.
        await loadQuestions(topic.file);

        console.log('Loading questions for topics');
        questions = await questGetAll(topic);

        updateStatus();
      }
    } catch (error) {
      errorStore.addError('ViewTopicInfo: ' + error.message);
    }
  });

  /**
   * Callback function for the back button.
   */
  const onBack = () => {
    viewStore.setView('ViewTopicList', { id: topic.file });
  };

  /**
   * Callback function for the listing button.
   */
  const onListing = () => {
    viewStore.setView('ViewTopicQuests', { topic: topic });
  };

  /**
   * Callback function for the start button.
   */
  const onStart = () => {
    viewStore.setView('ViewQuestAnswer', {
      topics: [topic],
      questions: questions
    });
  };

  /**
   * Callback function for the select box.
   */
  const onSelect = (e: Event) => {
    const target = e.target as HTMLSelectElement;

    if (!questions) {
      return;
    }

    //
    // Set the number of correct answers.
    //
    questSetProgressArr(questions, target.selectedIndex - 1);

    //
    // Set the index to 0 to restore the orignal state.
    //
    target.selectedIndex = 0;

    updateStatus();
  };
</script>

<div class="card card-shadow content">
  <div>
    <div class="is-text-left">
      <TopicInfo {topic} {status} {size} />
    </div>

    <div class="block">
      <label for="sf-set">Number of correct answers</label>
      <select id="sf-set" on:change={onSelect}>
        <option value="">-- Select --</option>
        <option value="0">Set 0</option>
        <option value="1">Set 1</option>
        <option value="2">Set 2</option>
        <option value="3">Set 3</option>
      </select>
    </div>

    {#if topic.details}
      <div class="block">
        <h5>Details</h5>
        <div class="card content is-info">
          <p>{@html md.toHtml(topic.details)}</p>
        </div>
      </div>
    {/if}
  </div>

  <div class="buttons">
    <button class="button" on:click={onBack}>Back</button>
    <button class="button" on:click={onListing}>Listing</button>
    <button class="button" disabled={startDisabled} on:click={onStart}
      >Start</button
    >
  </div>
</div>
