<script lang="ts">
  import { mdToHtml } from '../js/Markdown';
  import QuestProgress from './QuestProgress.svelte';
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  export let question: Question;
  export let topic: Topic;
  export let hideAnswer: boolean;
</script>

<div class="grid grid-2">
  <div>
    <div class="is-flex-spread block">
      <div class="h5">Question: {question.id}</div>
      <QuestProgress {question} />
    </div>

    <div class="card content is-primary">
      <p>{@html mdToHtml(question.quest)}</p>
    </div>
  </div>

  <div hidden={hideAnswer}>
    <h5>Answer</h5>
    <div class="card content is-info">
      <p>{@html mdToHtml(question.answer)}</p>
      {#if topic.details}
        <p>{@html mdToHtml(topic.details)}</p>
      {/if}
    </div>
  </div>
</div>
