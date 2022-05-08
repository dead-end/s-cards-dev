<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import { onMount } from 'svelte';
  import { adminStore } from '../stores/adminStore';
  import type { Admin } from '../stores/adminStore';
  import { questGetBackup, questSetRestore } from '../js/questModel';
  import { githubRestore, githubBackup } from '../js/github';
  import AdminShow from './AdminShow.svelte';
  import Popup from './Popup.svelte';

  let admin: Admin;
  let update: boolean = false;
  let status: string = '';

  const handleSubmit = (e) => {
    if (admin.langUrl) {
      adminStore.setAdmin(admin);
    }
    update = false;
  };

  onMount(async () => {
    admin = $adminStore;
  });

  const onBack = () => {
    viewStore.setView('ViewTopicList');
  };

  const onBackup = async () => {
    const backup = await questGetBackup();
    githubBackup(backup);
    status = 'Backup done!';
  };

  const onRestore = async () => {
    const json = await githubRestore();
    if (json) {
      questSetRestore(json);
      status = 'Restore done!';
    }
  };

  enum PopupType {
    Backup,
    Restore
  }

  let title: string;
  let msg: string;
  let showPopup = false;
  let callback: () => void;

  const doShowPopup = (type: PopupType) => {
    switch (type) {
      case PopupType.Backup:
        title = 'Information';
        msg = 'Do you realy want to create a backup?';
        callback = onBackup;
        break;
      case PopupType.Restore:
        title = 'Warning';
        msg = 'Do you realy want to restore the backup?';
        callback = onRestore;
        break;
      default:
        console.log('Unkown type', type);
        break;
    }

    showPopup = true;
  };

  const handlePopup = (event: CustomEvent) => {
    showPopup = false;
    if (event.detail !== 'ok') {
      return;
    }
    callback();
  };
</script>

<h4>Configuration</h4>
{#if status}
  <div class="block is-text-success">{status}</div>
{/if}

{#if admin}
  {#if update}
    <form on:submit|preventDefault={handleSubmit}>
      <div class="block">
        <label for="langUrl">Github URL Language</label>
        <input id="langUrl" type="url" bind:value={admin.langUrl} />

        <label for="backupUrl">Github URL Backup</label>
        <input id="backupUrl" type="url" bind:value={admin.backupUrl} />

        <label for="file">Github File</label>
        <input id="file" type="text" bind:value={admin.file} />

        <label for="token">Token</label>
        <input id="token" type="password" bind:value={admin.token} />
      </div>

      <div class="is-floating">
        <button class="button">Save</button>
        <button class="button" on:click={() => (update = false)}>Cancel</button>
        <button class="button" on:click={onBack}>Back</button>
      </div>
    </form>
  {:else}
    <div class="block">
      <AdminShow {admin} />
      <div class="is-floating">
        <button class="button" on:click={onBack}>Back</button>
        <button class="button" on:click={() => (update = true)}>Update</button>
        {#if admin.file && admin.backupUrl && admin.token}
          <button class="button" on:click={() => doShowPopup(PopupType.Backup)}
            >Backup</button
          >
          <button class="button" on:click={() => doShowPopup(PopupType.Restore)}
            >Restore</button
          >
        {/if}
      </div>
    </div>
  {/if}
{/if}

<Popup {title} {msg} on:popup={handlePopup} doShow={showPopup} />
