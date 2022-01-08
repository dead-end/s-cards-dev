<script lang="ts">
  import Markdown from '../js/Markdown';
  import QuestProgress from './QuestProgress.svelte';
  import type { Topic } from '../js/topicModel';
  import type { Question } from '../js/questModel';

  export let quest: Question;
  export let topic: Topic;
  export let hideAnswer: boolean;

  const md = new Markdown();
</script>

<div class="grid grid-2">
  <div>
    <div class="is-flex-spread block">
      <div class="h5">Question: {quest.id}</div>
      <QuestProgress {quest} />
    </div>

    <div class="card content is-primary">
      <p>{@html md.toHtml(quest.quest)}</p>
    </div>
  </div>

  <div hidden={hideAnswer}>
    <h5>Answer</h5>
    <div class="card content is-info">
      <p>{@html md.toHtml(quest.answer)}</p>
      {#if topic.details}
        <p>{@html md.toHtml(topic.details)}</p>
      {/if}
    </div>
  </div>
</div>
