<script lang="ts">
  import { fmtDate } from '../js/utils';
  import type { Topic } from '../js/topicModel';
  import { onMount } from 'svelte';
  import { hashGet } from '../js/hash';
  import type { Hash } from '../js/hash';

  export let topic: Topic;
  export let status = 0;
  export let size = 0;
  export let details = true;

  let hash: Hash;

  /**
   * Read the hash for the topic.
   */
  onMount(async () => {
    if (details) {
      hash = await hashGet(topic.file);
    }
  });
</script>

<h4>{topic.title}</h4>
<table>
  <tr>
    <td>Last learned</td>
    <td>{fmtDate(topic.lastLearned)}</td>
  </tr>
  <tr>
    <td>Tags</td>
    <td>{topic.tags.join(', ')}</td>
  </tr>
  {#if details}
    <tr>
      <td>Questions</td>
      <td>{size}</td>
    </tr>
    <tr>
      <td>Status</td>
      <td>{status}%</td>
    </tr>
    {#if hash}
      <tr>
        <td>Last loaded</td>
        <td>{fmtDate(hash.lastLoaded)}</td>
      </tr>
      <tr>
        <td>Hash</td>
        <td>{hash.value ? hash.value : ''}</td>
      </tr>
    {/if}
  {/if}
</table>
{#if topic.desc}
  <p>{topic.desc}</p>
{/if}
