<script>
  import { onMount } from 'svelte';
  import { TopicStore } from './stores/topicStore';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import Topic from './components/Topic.svelte';

  onMount(TopicStore.load);
</script>

<div class="container">
  <Header />

  <main>
    {#each $TopicStore as topic}
      <Topic {topic} />
    {/each}
  </main>

  <Footer />
</div>

<style>
</style>
