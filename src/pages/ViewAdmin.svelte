<script lang="ts">
  import type { Admin } from '../js/interfaces';
  import AdminShow from '../components/AdminShow.svelte';
  import Popup from '../components/Popup.svelte';
  import { questGetBackup, questSetRestore } from '../js/questModel';
  import { repoReadBackup, repoWriteBackup } from '../js/repo';
  import { viewStore } from '../stores/viewStore';
  import { errorStore } from '../stores/errorStore';
  import { adminStore } from '../stores/adminStore';

  let admin: Admin = adminStore.get();
  let update: boolean = false;
  let status: string = '';

  const handleSubmit = async () => {
    if (admin.langUrl) {
      const result = await adminStore.put(admin);
      if (result.hasError()) {
        errorStore.addError(`Error on save - ${result.getMessage()}`);
      }
    }
    update = false;
  };

  const onBack = () => {
    viewStore.setView('ViewTopicList', { id: '' });
  };

  const onBackup = async () => {
    try {
      const backup = await questGetBackup();
      const result = await repoWriteBackup(backup);
      if (result.hasError()) {
        errorStore.addError(`Unable to write backup - ${result.getMessage()}`);
        status = 'Backup FAILED!';
      } else {
        status = 'Backup done!';
      }
    } catch (e) {
      errorStore.addError(`Error on backup - ${e}`);
    }
  };

  const onRestore = async () => {
    const result = await repoReadBackup();
    if (result.hasError()) {
      errorStore.addError(result.getMessage());
      status = 'Restore FAILED!';
    } else {
      questSetRestore(result.getValue());
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
        <input
          id="langUrl"
          type="url"
          bind:value={admin.langUrl}
          class="input"
        />

        <label for="linkUrl">Github Link URL</label>
        <input
          id="linkUrl"
          type="url"
          bind:value={admin.linkUrl}
          class="input"
        />

        <label for="backupUrl">Github URL Backup</label>
        <input
          id="backupUrl"
          type="url"
          bind:value={admin.backupUrl}
          class="input"
        />

        <label for="file">Github File</label>
        <input id="file" type="text" bind:value={admin.file} class="input" />

        <label for="token">Token</label>
        <input
          id="token"
          type="password"
          bind:value={admin.token}
          class="input"
        />
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
