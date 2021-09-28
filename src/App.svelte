<script>
  import { onMount } from 'svelte';

  import ViewStore from './stores/viewStore';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import TopicList from './components/TopicList.svelte';

  onMount(() => {
    ViewStore.set({ component: TopicList });
  });
</script>

<div class="container">
  <Header />

  <div id="main" class="block">
    <svelte:component this={$ViewStore.component} {...$ViewStore.props} />
  </div>

  <Footer />
</div>

<style>
</style>
