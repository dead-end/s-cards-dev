<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  import { topicGetAll, topicGetTags } from '../js/topicModel';
  import type { Topic } from '../js/topicModel';

  import { viewStore } from '../stores/viewStore';

  import TopicCard from '../components/TopicCard.svelte';

  //
  // Id to scroll the view to.
  //
  export let id: string | void;

  let topicsRaw: Topic[] = [];
  let topicsView: Topic[] = [];

  let tags: String[];

  let filter: string;
  let sort: string;

  /**
   * Sort and filter
   */
  const doSortFilter = () => {
    let tmp: Topic[];

    if (!filter) {
      tmp = [...topicsRaw];
    } else {
      tmp = topicsRaw.filter((t) => t.tags.includes(filter));
    }

    console.log('sort', sort);
    if (sort && sort === 'time') {
      console.log('sorting');
      tmp.sort((a, b) => {
        const aTime = a.lastLearned ? a.lastLearned.getTime() : 0;
        const bTime = b.lastLearned ? b.lastLearned.getTime() : 0;
        return bTime - aTime;
      });
    }

    topicsView = tmp;
  };

  /**
   * On mount, get all the topics from the store.
   */
  onMount(() => {
    topicGetAll().then((t) => {
      topicsRaw = t;
      topicsView = t;
      tags = topicGetTags(topicsRaw);
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
  <div class="is-floating">
    <label class="is-valign-center" for="sort-select">Sort</label>
    <select id="sort-select" bind:value={sort} on:change={doSortFilter}>
      <option value="">-- Select --</option>
      <option value="time">Last learned</option>
    </select>

    <label for="tag-select">Tag Filter</label>
    <select id="tag-select" bind:value={filter} on:change={doSortFilter}>
      <option value="">-- Select --</option>
      {#each tags as tag}
        <option value={tag}>{tag}</option>
      {/each}
    </select>

    {#if filter}
      <button
        class="button"
        on:click={() =>
          viewStore.setView('ViewTagInfo', { tag: filter, topics: topicsView })}
        >Show</button
      >
    {/if}
    <button class="button" on:click={() => viewStore.setView('ViewTranslate')}
      >Translate</button
    >
    <button class="button" on:click={() => viewStore.setView('ViewHashes')}
      >Hashes</button
    >
    <button class="button" on:click={() => viewStore.setView('ViewAdmin')}
      >Admin</button
    >
  </div>
{/if}

<div class="grid grid-4">
  {#each topicsView as topic}
    <TopicCard {topic} />
  {/each}
</div>
