<script lang="ts">
  import { fmtDate } from '../js/utils';
  import type { Topic } from '../js/topicModel';

  export let topic: Topic;
  export let status = 0;
  export let size = 0;
</script>

<h4>{topic.title}</h4>
<table>
  <tr>
    <td>Modified</td>
    <td>{fmtDate(topic.lastModified)}</td>
  </tr>
  <tr>
    <td>Status</td>
    <td>{status}%</td>
  </tr>
  <tr>
    <td>Size</td>
    <td>{size}</td>
  </tr>
  <tr>
    <td>Tags</td>
    <td>{topic.tags.join(', ')}</td>
  </tr>
</table>
{#if topic.desc}
  <p>{topic.desc}</p>
{/if}
