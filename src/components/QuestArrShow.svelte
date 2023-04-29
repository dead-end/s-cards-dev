<script lang="ts">
  import type { Question } from '../js/questModel';
  import QuestProgress from './QuestProgress.svelte';
  import Markdown from '../js/Markdown';
  import EditIcon from './icon/EditIcon.svelte';
  import { afterUpdate } from 'svelte';
  import { createRepeatToggle } from '../js/utils';
  import { viewStore } from '../stores/viewStore';
  import { adminStore } from '../stores/adminStore';

  export let questions: Question[];

  let details: boolean = false;
  let sorted: Question[] = [];
  let sortBy: String = '';

  const md = new Markdown();

  afterUpdate(() => {
    console.log('afterUpdate questions:', questions);
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
  <label for="details-checkbox">Details</label>
  <input type="checkbox" id="details-checkbox" bind:checked={details} />

  <label for="quest-sort">Sort</label>
  <select id="quest-sort" bind:value={sortBy} on:change={doSort}>
    <option value="">-- Select --</option>
    <option value="total">Total</option>
    <option value="ratio">Ratio</option>
  </select>
</div>

<div class="grid grid-2">
  {#each sorted as question}
    {#if details}
      <div class="is-flex-spread grid-full">
        <div>
          <span class="h6">Id: {question.id}</span>

          <span class="hide-sm">
            <a href={$adminStore.linkUrl + question.file} target="_blank"
              >{question.file}</a
            >
          </span>
          <EditIcon
            onClick={() =>
              viewStore.setView('ViewQuestEdit', { question: question })}
          />
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
