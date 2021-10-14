<script>
  import { viewStore } from '../stores/viewStore';

  import { loadQuestions } from '../js/persist';
  import { dbqSetCurrent, dbqGetStats } from '../js/dbQuest';
  import { fmtDate, arrPercentage, arrAll } from '../js/utils';

  import { onMount } from 'svelte';

  export let topic;
  // TODO: comments

  let status = '';
  let startDisabled = true;
  let size = 0;

  const updateStatus = () => {
    dbqGetStats().then((arr) => {
      status = arrPercentage(arr, 3);
      startDisabled = arrAll(arr, 3);
      size = arr.length;
    });
  };

  onMount(() => {
    loadQuestions(topic.file);
    updateStatus();
  });

  const onBack = () => {
    viewStore.setView('TopicList');
  };

  const onListing = (topic) => {
    viewStore.setView('QuestList', { topic: topic });
  };

  const onSelect = (e) => {
    console.log('index', e.target.selectedIndex);
    //
    // Set the number of correct answers.
    //
    dbqSetCurrent(topic.file, e.target.selectedIndex - 1);

    //
    // Set the index to 0 to restore the orignal state.
    //
    e.target.selectedIndex = 0;

    updateStatus();
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
        <td>{status}</td>
      </tr>
      <tr>
        <td>Size</td>
        <td>{size}</td>
      </tr>
    </table>

    <div>
      <label for="sf-set">Number of correct answers</label>
      <select id="sf-set" on:change={onSelect}>
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
    <button class="button" disabled={startDisabled}>Start</button>
  </div>
</div>
