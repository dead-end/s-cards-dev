<script>
  import { viewStore } from '../stores/viewStore';

  import TopicList from './TopicList.svelte';

  export let topic;

  const onBack = () => {
    viewStore.set({ component: TopicList });
  };
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>

  <div class="grid grid-4">
    <table class="is-text-left">
      <tr>
        <td>Modified</td>
        <td />
      </tr>
      <tr>
        <td>Status</td>
        <td />
      </tr>
      <tr>
        <td>File</td>
        <td>{topic.file}</td>
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
    <button class="button">Listing</button>
    <button class="button">Start</button>
  </div>
</div>
