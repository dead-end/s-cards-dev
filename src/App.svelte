<script lang="ts">
  import { onMount } from 'svelte';

  import { viewStore } from './stores/viewStore';
  import { errorStore } from './stores/errorStore';

  import { initApp } from './js/persist';
  import { pwaSerivceWorkerRegister } from './js/pwa';

  import ErrorShow from './components/ErrorShow.svelte';
  import TopicList from './components/TopicList.svelte';
  import TopicShow from './components/TopicShow.svelte';
  import QuestArrTopic from './components/QuestArrTopic.svelte';
  import QuestArrTag from './components/QuestArrTag.svelte';
  import QuestShow from './components/QuestShow.svelte';
  import TagShow from './components/TagShow.svelte';

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
      QuestArrTopic: {
        component: QuestArrTopic,
      },
      QuestArrTag: {
        component: QuestArrTag,
      },
      QuestShow: {
        component: QuestShow,
      },
      TagShow: {
        component: TagShow,
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
  <h2>Cards</h2>

  <!-- 
    Calling a view can cause an error, so if you hide the view until you
    confirmed the error and the show the view again, you repeat the error and
    you end up in a loop.
  -->
  {#if $errorStore.length !== 0}
    <ErrorShow />
  {/if}

  <div id="main" class="block">
    <svelte:component this={$viewStore.component} {...$viewStore.props} />
  </div>

  <div class="block">
    <div class="is-text-right">by Volker Senkel 2021</div>
  </div>
</div>
