<script lang="ts">
  import { onMount } from 'svelte';

  import { hashGetAll, hashDel } from '../js/hash';
  import type { Hash } from '../js/hash';
  import { fmtDate } from '../js/utils';

  import { viewStore } from '../stores/viewStore';

  let hashes: Hash[] = [];

  let filter: string = 'file';

  const doFilter = () => {
    console.log('sort', filter);

    if (filter === 'file') {
      hashes.sort((b, a) => +(a.file > b.file) || -(a.file < b.file));
    } else {
      hashes.sort(
        (b, a) =>
          +(a.lastLoaded > b.lastLoaded) || -(a.lastLoaded < b.lastLoaded)
      );
    }

    hashes = hashes;
  };

  const doLoad = async () => {
    hashes = await hashGetAll();
    doFilter();
  };

  const doDelete = async (file: string) => {
    await hashDel(file);
    doLoad();
  };

  const onBack = () => {
    viewStore.setView('ViewTopicList');
  };

  onMount(() => {
    doLoad();
  });
</script>

<div class="is-floating">
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
    <th />
  </tr>
  {#each hashes as hash}
    <tr>
      <td>{hash.file}</td>
      <td>{hash.value}</td>
      <td>{fmtDate(hash.lastLoaded)}</td>
      <td
        ><button class="button" on:click={() => doDelete(hash.file)}
          >Delete</button
        ></td
      >
    </tr>
  {/each}
</table>

<div class="is-floating">
  <button class="button" on:click={() => onBack()}>Back</button>
</div>
