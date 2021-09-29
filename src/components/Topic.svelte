<script>
  import { viewStore } from '../stores/viewStore';

  import TopicShow from './TopicShow.svelte';

  export let topic;

  const onClick = (topic) => {
    viewStore.set({ component: TopicShow, props: { topic: topic } });
  };
</script>

<div class="card card-shadow content">
  <h4>{topic.title}</h4>
  <table>
    <tr>
      <td>Modified</td>
      <td />
    </tr>
    <tr>
      <td>Status</td>
      <td />
    </tr>
  </table>
  {#if topic.desc}
    <p>{topic.desc}</p>
  {/if}
  <div class="buttons">
    <button class="button" on:click={() => onClick(topic)}>Show</button>
  </div>
</div>
