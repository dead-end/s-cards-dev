<script lang="ts">
  import QuestProgress from './QuestProgress.svelte';
  import Markdown from '../js/Markdown';
  import { createRepeatToggle } from '../js/utils';
  import type { Question } from '../js/questModel';
  import { onMount } from 'svelte';

  export let questions: Question[];

  let details: string = '0';
  let sorted: Question[] = [];
  let sortBy: String = '';

  const md = new Markdown();

  onMount(() => {
    console.log('questions', questions);
    sorted = questions;
  });

  const doSort = () => {
    if (!sortBy) {
      sorted = questions;
      return;
    }
    let tmp: Question[] = [...questions];

    if (sortBy === 'ratio') {
      tmp.sort((a, b) => {
        return b.ratio - a.ratio;
      });
    } else if (sortBy === 'total') {
      tmp.sort((a, b) => {
        return b.total - a.total;
      });
    }

    sorted = tmp;
  };

  //
  // The function toogles the values after 2 calls.
  //
  const repeatToggle = createRepeatToggle(2, 'is-primary', 'is-info');
</script>

<div class="is-floating">
  <label for="details-select">Details</label>
  <select id="details-select" bind:value={details}>
    <option value="0">Simple</option>
    <option value="1">Progress</option>
    <option value="2">ID's</option>
  </select>

  <label for="quest-sort">Tag Filter</label>
  <select id="quest-sort" bind:value={sortBy} on:change={doSort}>
    <option value="">-- Select --</option>
    <option value="total">Total</option>
    <option value="ratio">Ratio</option>
  </select>
</div>

<div class="grid grid-2">
  {#each sorted as question}
    {#if details === '1' || details === '2'}
      <div class="is-flex-spread grid-full">
        <div>
          {#if details === '2'}
            <span class="h6">Id: {question.id}</span>
            <span class="hide-sm">{question.file}</span>
          {/if}
        </div>
        <QuestProgress {question} />
      </div>
    {/if}

    <div class="card {repeatToggle()}">
      <div class="content">
        <p>{@html md.toHtml(question.quest)}</p>
      </div>
    </div>
    <div class="card {repeatToggle()}">
      <div class="content">
        <p>{@html md.toHtml(question.answer)}</p>
      </div>
    </div>
  {/each}
</div>
