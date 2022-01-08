<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { topicGetAll, topicsGetTags } from '../js/topicModel';
  import TopicCard from './TopicCard.svelte';
  import type { Topic } from '../js/topicModel';
  import { viewStore } from '../stores/viewStore';

  //
  // Id to scroll the view to.
  //
  export let id: string | void = null;

  let topics: Array<Topic> = [];

  let filtered: Array<Topic> = [];

  let tags: String[];

  let filter: string;

  /**
   * Filter the topics with a tag.
   */
  const doFilter = () => {
    if (!filter) {
      filtered = topics;
    } else {
      filtered = topics.filter((t) => t.tags.includes(filter));
    }
  };

  /**
   * On mount, get all the topics from the store.
   */
  onMount(() => {
    topicGetAll().then((t) => {
      topics = t;
      filtered = t;
      tags = topicsGetTags(topics);
    });
  });

  /**
   * The function is called after an update. An update can be an empty list.
   */
  afterUpdate(() => {
    if (id) {
      const elem = document.getElementById(id);
      if (elem) {
        elem.scrollIntoView();
      }
    }
  });
</script>

{#if tags}
  <div class="block">
    <label for="tag-select">Tag Filter</label>
    <select id="tag-select" bind:value={filter} on:change={doFilter}>
      <option value="">-- Select --</option>
      {#each tags as tag}
        <option value={tag}>{tag}</option>
      {/each}
    </select>

    {#if filter}
      <button
        class="button"
        on:click={() =>
          viewStore.setView('ViewTagInfo', { tag: filter, topics: filtered })}
        >Show</button
      >
    {/if}
  </div>
{/if}

<div class="grid grid-4">
  {#each filtered as topic}
    <TopicCard {topic} />
  {/each}
</div>
