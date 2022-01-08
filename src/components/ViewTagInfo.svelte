<script lang="ts">
  import type { Topic } from '../js/topicModel';
  import { viewStore } from '../stores/viewStore';

  export let tag: string;
  export let topics: Topic[];

  let correct: -1;
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
    <button
      class="button"
      on:click={() => {
        viewStore.setView('ViewTopicList');
      }}>Back</button
    >
    <button
      class="button"
      on:click={() =>
        viewStore.setView('ViewTagQuests', { tag: tag, topics: topics })}
      >Listing</button
    >
  </div>
</div>
