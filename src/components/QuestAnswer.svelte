<script lang="ts">
  import Markdown from '../js/Markdown';
  import QuestProgress from './QuestProgress.svelte';
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  export let question: Question;
  export let topic: Topic;
  export let hideAnswer: boolean;

  const md = new Markdown();
</script>

<div class="grid grid-2">
  <div>
    <div class="is-flex-spread block">
      <div class="h5">Question: {question.id}</div>
      <QuestProgress {question} />
    </div>

    <div class="card content is-primary">
      <p>{@html md.toHtml(question.quest)}</p>
    </div>
  </div>

  <div hidden={hideAnswer}>
    <h5>Answer</h5>
    <div class="card content is-info">
      <p>{@html md.toHtml(question.answer)}</p>
      {#if topic.details}
        <p>{@html md.toHtml(topic.details)}</p>
      {/if}
    </div>
  </div>
</div>
