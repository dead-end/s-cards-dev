<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import { onMount } from 'svelte';
  import { Admin, adminStore } from '../stores/adminStore';

  let admin: Admin;
  let update: boolean = false;

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
</script>

<h4>Configuration</h4>

{#if admin}
  {#if update}
    <form on:submit|preventDefault={handleSubmit}>
      <div class="block">
        <label for="langUrl">Github URL language</label>
        <input id="langUrl" type="url" bind:value={admin.langUrl} />

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
      <table>
        <tr>
          <td>Github URL</td>
          <td>{admin.langUrl}</td>
        </tr>
        <tr>
          <td>Token</td>
          <td>
            {#if admin.token}
              {admin.token.substring(0, 3)}...
            {/if}
          </td>
        </tr>
      </table>
      <div class="buttons">
        <button class="button" on:click={() => (update = true)}>Update</button>
        <button class="button" on:click={onBack}>Back</button>
      </div>
    </div>
  {/if}
{/if}
