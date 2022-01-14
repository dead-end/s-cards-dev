<script lang="ts">
  import type { Question } from '../js/questModel';
  import type { Topic } from '../js/topicModel';
  import { viewStore } from '../stores/viewStore';
  import { onMount } from 'svelte';
  import { questGetTag } from '../js/questModel';
  import { loadQuestions } from '../js/persist';
  import { errorStore } from '../stores/errorStore';

  export let tag: string;
  export let topics: Topic[];
  export let questions: Question[] | void = null;

  let correct: -1;

  /**
   * The callback funciton to show the listing view.
   */
  const onListing = () => {
    viewStore.setView('ViewTagQuests', {
      tag: tag,
      topics: topics,
      questions: questions,
    });
  };

  /**
   * The callback functoin to go back.
   */
  const onBack = () => {
    viewStore.setView('ViewTopicList');
  };

  /**
   * Callback function for the mount event.
   */
  onMount(async () => {
    try {
      //
      // Loading the questions for a tag can be expensive, so we do it only if
      // it is necessary.
      //
      if (!questions) {
        //
        // We load the questions for each file async.
        //
        const promises: Promise<void>[] = [];
        topics.forEach((t) => {
          promises.push(loadQuestions(t.file));
        });

        await Promise.all(promises);

        console.log('Loading questions for topics');
        questions = await questGetTag(topics, 30);
      }
    } catch (error) {
      errorStore.addError('ViewTagInfo: ' + error.message);
    }
  });

  // TODO: select callback
</script>

<div class="card card-shadow content">
  <div class="grid grid-4">
    <div class="is-text-left">
      Tag: {tag}

      <ul>
        {#each topics as topic}
          <li>{topic.title}</li>
        {/each}
      </ul>
    </div>
  </div>

  <div>
    <label for="sf-set">Number of correct answers</label>
    <select id="sf-set" bind:value={correct}>
      <option value="-1">-- Select --</option>
      <option value="0">Set 0</option>
      <option value="1">Set 1</option>
      <option value="2">Set 2</option>
    </select>
  </div>

  <div class="buttons">
    <button class="button" on:click={onBack}>Back</button>
    <button class="button" on:click={onListing}>Listing</button>
  </div>
</div>
