<script>
  import { onMount } from 'svelte';

  import { viewStore } from './stores/viewStore';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import TopicList from './components/TopicList.svelte';

  onMount(() => {
    viewStore.set({ component: TopicList });
  });
</script>

<div class="container">
  <Header />

  <div id="main" class="block">
    <svelte:component this={$viewStore.component} {...$viewStore.props} />
  </div>

  <Footer />
</div>

<style>
</style>
