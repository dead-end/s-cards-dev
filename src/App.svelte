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

  <div id="main" class="block">
    <div class="grid grid-4" id="pool-list-body">
      {#each $TopicStore as topic}
        <Topic {topic} />
      {/each}
    </div>
  </div>

  <Footer />
</div>

<style>
</style>
