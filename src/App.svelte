<script>
  import { onMount } from 'svelte';

  import { viewStore } from './stores/viewStore';

  import { initDB } from './js/persist';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import TopicList from './components/TopicList.svelte';
  import TopicShow from './components/TopicShow.svelte';

  onMount(() => {
    initDB();

    viewStore.views = {
      TopicList: {
        component: TopicList,
      },
      TopicShow: {
        component: TopicShow,
      },
    };
    viewStore.setView('TopicList');
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
