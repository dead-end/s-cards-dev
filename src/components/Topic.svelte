<script>
  export let topic;
</script>

<h4>{topic.title}</h4>
<p>{topic.file}</p>
{#if topic.desc}
  <p>{topic.desc}</p>
{/if}
