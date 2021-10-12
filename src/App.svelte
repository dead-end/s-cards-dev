<script>
  import { onMount } from 'svelte';

  import { viewStore } from './stores/viewStore';

  import { initApp } from './js/persist';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import TopicList from './components/TopicList.svelte';
  import TopicShow from './components/TopicShow.svelte';
  import QuestList from './components/QuestList.svelte';

  onMount(() => {
    viewStore.views = {
      TopicList: {
        component: TopicList,
      },
      TopicShow: {
        component: TopicShow,
      },
      QuestList: {
        component: QuestList,
      },
    };
    //
    // Set the view if the initialization of the app finished.
    //
    initApp().then(() => {
      viewStore.setView('TopicList');
    });
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
