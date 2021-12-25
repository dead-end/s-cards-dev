<script lang="ts">
  import type { Question } from '../js/questModel';

  export let quest: Question;
</script>

<span class="h6">
  Progress: <span class="is-text-success">{quest.progress}</span> /
  <span class="is-text-success">3</span>

  <span class="hide-sm">
    Total: <span class="is-text-success">{quest.total}</span> Wrong:
    <span class="is-text-danger">{quest.ratio}%</span>
  </span>
</span>
