<script lang="ts">
  import { onMount } from 'svelte';

  import { viewStore } from './stores/viewStore';
  import { errorStore } from './stores/errorStore';
  import { adminStore } from './stores/adminStore';

  import ErrorShow from './components/ErrorShow.svelte';

  import ViewTopicList from './pages/ViewTopicList.svelte';
  import ViewTopicInfo from './pages/ViewTopicInfo.svelte';
  import ViewTopicQuests from './pages/ViewTopicQuests.svelte';
  import ViewTagInfo from './pages/ViewTagInfo.svelte';
  import ViewTagQuests from './pages/ViewTagQuests.svelte';
  import ViewQuestAnswer from './pages/ViewQuestAnswer.svelte';
  import ViewTranslate from './pages/ViewTranslate.svelte';
  import ViewHashes from './pages/ViewHashes.svelte';
  import ViewAdmin from './pages/ViewAdmin.svelte';
  import ViewSearch from './pages/ViewSearch.svelte';
  import ViewQuestEdit from './pages/ViewQuestEdit.svelte';

  import { topicSetup } from './js/topicModel';

  onMount(async () => {
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
      },
      ViewSearch: {
        component: ViewSearch
      },
      ViewQuestEdit: {
        component: ViewQuestEdit
      }
    };

    await adminStore.init();
    await topicSetup();

    viewStore.setView('ViewTopicList', { id: '' });
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
