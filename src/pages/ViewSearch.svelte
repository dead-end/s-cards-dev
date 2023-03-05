<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import QuestArrShow from '../components/QuestArrShow.svelte';
  import type { Question } from '../js/questModel';
  import { questSearch } from '../js/questModel';

  const max = 2;

  let searchStr = '';
  let questions: Question[] = [];
  let message = '';
  let total = 0;
  let found = 0;

  const handleSubmit = async () => {
    console.log('Searching', searchStr);

    const str = searchStr.trim();

    if (!str || str.length < 3) {
      message = 'Please enter search string with at least 3 chars!';
      return;
    }

    if (message) {
      message = '';
    }

    [questions, total, found] = await questSearch(str, max);

    if (questions.length === 0) {
      message = 'Nothing found!';
    } else if (questions.length < found) {
      message = 'More than: ' + max + ' questions found';
    }
  };

  // TODO
  const onClick = () => {
    console.log('click');
  };

  // TODO
  const onClear = () => {
    searchStr = '';
    questions = [];
  };

  const onBack = () => {
    viewStore.setView('ViewTopicList', { id: '' });
  };
</script>

<h4>Search</h4>

<form on:submit|preventDefault={handleSubmit}>
  <div class="block">
    <label for="searchStr">Search String</label>
    <input id="searchStr" bind:value={searchStr} class="input" />
    {#if message}
      <div class="is-text-danger">{message}</div>
    {/if}
  </div>

  <div class="is-floating">
    <button class="button" type="submit">Search</button>
  </div>
</form>

{#if questions.length !== 0}
  <div>Total: {total} found: {found}</div>
  <QuestArrShow {questions} />
{/if}

<div class="is-floating">
  <button class="button" on:click={onBack}>Back</button>
</div>
