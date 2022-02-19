<script lang="ts">
  import type { Question } from '../js/questModel';

  export let question: Question;
</script>

<div class="h6">
  Progress: <span class="is-text-success">{question.progress}</span> /
  <span class="is-text-success">3</span>

  <span class="hide-sm">
    Total: <span class="is-text-success">{question.total}</span> Wrong:
    <span class="is-text-danger">{question.ratio}%</span>
  </span>
</div>
