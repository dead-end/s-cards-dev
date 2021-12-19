<script lang="ts">
  import type { Question } from '../js/questModel';

  export let quest: Question;
  export let showProgress: boolean;
</script>

{#if quest.total != 0}
  <span class="h6">
    {#if showProgress}
      Progress: <span class="is-text-success">{quest.progress}</span>
    {/if}

    <span class="show-md">
      (Total: <span class="is-text-success">{quest.total}</span> /
      <span class="is-text-danger">{quest.failed}</span>
      / Wrong:
      <span>{quest.ratio}%</span>)
    </span>
  </span>
{/if}
