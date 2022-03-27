<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import { onMount } from 'svelte';
  import { Admin, adminStore } from '../stores/adminStore';
  import { questGetBackup, questSetRestore } from '../js/questModel';
  import { githubRestore, githubBackup } from '../js/github';
  import AdminShow from './AdminShow.svelte';

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

      <div class="buttons">
        <button class="button">Save</button>
        <button class="button" on:click={() => (update = false)}>Cancel</button>
        <button class="button" on:click={onBack}>Back</button>
      </div>
    </form>
  {:else}
    <div class="block">
      <AdminShow {admin} />
      <div class="buttons">
        <button class="button" on:click={onBack}>Back</button>
        <button class="button" on:click={() => (update = true)}>Update</button>
        {#if admin.file && admin.backupUrl && admin.token}
          <button class="button" on:click={onBackup}>Backup</button>
          <button class="button" on:click={onRestore}>Restore</button>
        {/if}
      </div>
    </div>
  {/if}
{/if}
