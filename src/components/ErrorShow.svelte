<script lang="ts">
  import { errorStore } from '../stores/errorStore';

  /**
   * On the button click, remove the errors from the store.
   */
  const onOk = () => {
    errorStore.resetErrors();
  };
</script>

<div class="card card-shadow block content">
  <h4 class="is-text-danger">Errors</h4>
  <ul>
    {#each $errorStore as error}
      <li>{error}</li>
    {/each}
  </ul>
  <div class="is-floating">
    <button class="button" on:click={onOk}>Ok</button>
  </div>
</div>
