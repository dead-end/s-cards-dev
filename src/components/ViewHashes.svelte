<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import { onMount } from 'svelte';
  import { Hash, hashGetAll } from '../js/hash';
  import { fmtDate } from '../js/utils';

  let hashes: Hash[] = [];

  let filter: string = 'file';

  const doFilter = () => {
    console.log('sort', filter);
    hashes.sort((b, a) => +(a[filter] > b[filter]) || -(a[filter] < b[filter]));
    hashes = hashes;
  };

  const onBack = () => {
    viewStore.setView('ViewTopicList');
  };

  onMount(async () => {
    hashes = await hashGetAll();
    doFilter();
  });
</script>

<div class="block">
  <label for="sort-select">Tag Filter</label>
  <select id="sort-select" bind:value={filter} on:change={doFilter}>
    <option value="file">By Name</option>
    <option value="lastLoaded">By Date</option>
  </select>
</div>

<table>
  <tr>
    <th>File</th>
    <th>Hash</th>
    <th>Last Loaded</th>
  </tr>
  {#each hashes as hash}
    <tr>
      <td>{hash.file}</td>
      <td>{hash.value}</td>
      <td>{fmtDate(hash.lastLoaded)}</td>
    </tr>
  {/each}
</table>

<div class="buttons">
  <button class="button" on:click={() => onBack()}>Back</button>
</div>
