<script lang="ts">
  import QuestProgress from './QuestProgress.svelte';
  import Markdown from '../js/Markdown';
  import { createRepeatToggle } from '../js/utils';
  import type { Question } from '../js/questModel';

  export let questions: Question[];

  const md = new Markdown();

  //
  // The function toogles the values after 2 calls.
  //
  const repeatToggle = createRepeatToggle(2, 'is-primary', 'is-info');
</script>

<div class="grid grid-2">
  {#each questions as question}
    <div class="is-flex-spread grid-full">
      <div class="h6">Id: {question.id}</div>
      <QuestProgress quest={question} />
    </div>

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
