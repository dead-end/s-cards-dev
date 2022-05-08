<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title = '';
  export let msg = '';
  export let doShow = false;

  const dispatch = createEventDispatcher();
</script>

<div class="popup" style:display={doShow ? 'block' : 'none'}>
  <div class="popup-content">
    <h5>{title}</h5>
    <p>{msg}</p>
    <div class="is-floating">
      <button class="button" on:click={() => dispatch('popup', 'ok')}>OK</button
      >
      <button class="button" on:click={() => dispatch('popup', 'cancel')}
        >Cancel</button
      >
    </div>
  </div>
</div>
