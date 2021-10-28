<script>
  import { onMount } from 'svelte';

  import { viewStore } from './stores/viewStore';
  import { errorStore } from './stores/errorStore';

  import { initApp } from './js/persist';
  import { pwaSerivceWorkerRegister } from './js/pwa';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import ErrorShow from './components/ErrorShow.svelte';
  import TopicList from './components/TopicList.svelte';
  import TopicShow from './components/TopicShow.svelte';
  import QuestList from './components/QuestList.svelte';
  import QuestShow from './components/QuestShow.svelte';

  onMount(() => {
    try {
      pwaSerivceWorkerRegister();
    } catch (error) {
      errorStore.addError(error);
    }

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
      QuestShow: {
        component: QuestShow,
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

  {#if $errorStore.length !== 0}
    <ErrorShow />
  {/if}

  <div id="main" class="block">
    <svelte:component this={$viewStore.component} {...$viewStore.props} />
  </div>

  <Footer />
</div>
