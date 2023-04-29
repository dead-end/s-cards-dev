<script lang="ts">
  import type { Question } from '../js/questModel';
  import QuestArrShow from '../components/QuestArrShow.svelte';
  import SearchIcon from '../components/icon/SearchIcon.svelte';
  import { viewStore } from '../stores/viewStore';
  import { onMount } from 'svelte';
  import { questSearch } from '../js/questModel';

  /**
   * Both values are only set, when we go back from editing.
   */
  export let searchStr = '';
  export let details = false;

  const max = 30;

  let questions: Question[] = [];
  let message = '';
  let total = 0;
  let found = 0;

  /**
   * The function does the search. It is called on submit and on mount. On
   * mount it is possible that there is no search string.
   */
  const doSearch = async () => {
    console.log('Searching:', searchStr);

    const str = searchStr.trim();

    if (!str || str.length < 3) {
      message = 'Please enter search string with at least 3 chars!';
      return;
    }

    if (message) {
      message = '';
    }

    questions = [];

    [questions, total, found] = await questSearch(str, max);

    if (questions.length === 0) {
      message = 'Nothing found!';
    } else if (questions.length < found) {
      message = `More than: ${max} questions found! (Total: ${found})`;
    }
  };

  /**
   * Call the submit function on mount.
   */
  onMount(() => {
    //
    // Ignore search without error message if no search string is present.
    //
    if (!searchStr) {
      return;
    }
    doSearch();
  });

  /**
   * Function to go back to the topic list.
   */
  const onBack = () => {
    viewStore.setView('ViewTopicList', { id: '' });
  };

  /**
   * Function to go back to this view after editing a question.
   */
  const goBackFct = () => {
    viewStore.setView('ViewSearch', { searchStr: searchStr, details: true });
  };
</script>

<h4>Search</h4>

<form on:submit|preventDefault={doSearch}>
  <div class="">
    <label for="searchStr">Search String</label>
    <div class="is-floating">
      <input id="searchStr" bind:value={searchStr} class="input" />
      <SearchIcon onClick={doSearch} />
    </div>

    {#if message}
      <div class="is-text-danger">{message}</div>
    {/if}
  </div>
</form>

{#if questions.length !== 0}
  <div>Total: {total} found: {found}</div>
  <QuestArrShow {questions} {details} {goBackFct} />
{/if}

<div class="is-floating">
  <button class="button" on:click={onBack}>Back</button>
</div>
