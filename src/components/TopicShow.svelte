<script>
  import { viewStore } from '../stores/viewStore';

  import { loadQuestions } from '../js/persist';
  import { fmtDate } from '../js/utils';

  import { onMount } from 'svelte';

  export let topic;

  onMount(() => loadQuestions(topic.file));

  const onBack = () => {
    viewStore.setView('TopicList');
  };

  const onListing = (topic) => {
    viewStore.setView('QuestList', { topic: topic });
  };
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>

  <div class="grid grid-4">
    <table class="is-text-left">
      <tr>
        <td>File</td>
        <td>{topic.file}</td>
      </tr>
      <tr>
        <td>Modified</td>
        <td>{fmtDate(topic.lastModified)}</td>
      </tr>
      <tr>
        <td>Description</td>
        <td>{topic.desc}</td>
      </tr>
      <tr>
        <td>Status</td>
        <td />
      </tr>
      <tr>
        <td>Size</td>
        <td />
      </tr>
    </table>

    <div>
      <label for="sf-set">Number of correct answers</label>
      <select id="sf-set">
        <option value="">-- Select --</option>
        <option value="0">Set 0</option>
        <option value="1">Set 1</option>
        <option value="2">Set 2</option>
        <option value="3">Set 3</option>
      </select>
    </div>
  </div>

  <div class="buttons">
    <button class="button" on:click={onBack}>Back</button>
    <button class="button" on:click={() => onListing(topic)}>Listing</button>
    <button class="button">Start</button>
  </div>
</div>
