<script lang="ts">
  import { onMount } from 'svelte';

  import { viewStore } from './stores/viewStore';
  import { errorStore } from './stores/errorStore';

  import { pwaSerivceWorkerRegister } from './js/pwa';

  import ErrorShow from './components/ErrorShow.svelte';

  import ViewTopicList from './components/ViewTopicList.svelte';
  import ViewTopicInfo from './components/ViewTopicInfo.svelte';
  import ViewTopicQuests from './components/ViewTopicQuests.svelte';
  import ViewTagInfo from './components/ViewTagInfo.svelte';
  import ViewTagQuests from './components/ViewTagQuests.svelte';
  import ViewQuestAnswer from './components/ViewQuestAnswer.svelte';
  import ViewTranslate from './components/ViewTranslate.svelte';
  import ViewHashes from './components/ViewHashes.svelte';
  import ViewAdmin from './components/ViewAdmin.svelte';

  onMount(() => {
    try {
      pwaSerivceWorkerRegister();
    } catch (error) {
      errorStore.addError('App onMount(): ' + error);
    }

    //
    // Register the views
    //
    viewStore.views = {
      ViewTopicList: {
        component: ViewTopicList
      },
      ViewTopicInfo: {
        component: ViewTopicInfo
      },
      ViewTopicQuests: {
        component: ViewTopicQuests
      },
      ViewTagInfo: {
        component: ViewTagInfo
      },
      ViewTagQuests: {
        component: ViewTagQuests
      },
      ViewQuestAnswer: {
        component: ViewQuestAnswer
      },
      ViewTranslate: {
        component: ViewTranslate
      },
      ViewHashes: {
        component: ViewHashes
      },
      ViewAdmin: {
        component: ViewAdmin
      }
    };

    viewStore.setView('ViewTopicList');
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
