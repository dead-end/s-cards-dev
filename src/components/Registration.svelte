<script>
  export let registration;
</script>

<h4>{registration.title}</h4>
<p>{registration.file}</p>
{#if registration.desc}
  <p>{registration.desc}</p>
{/if}
