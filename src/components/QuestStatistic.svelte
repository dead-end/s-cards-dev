<script lang="ts">
  export let statistic = [0, 0, 0, 0];
</script>

<table class="table hide-md">
  <tr>
    <td>No correct Answers</td>
    <td>{statistic[0]}</td>
  </tr>
  <tr>
    <td>One correct Answer</td>
    <td>{statistic[1]}</td>
  </tr>
  <tr>
    <td>Two correct Answers</td>
    <td>{statistic[2]}</td>
  </tr>
  <tr>
    <td>Learned</td>
    <td>{statistic[3]}</td>
  </tr>
</table>
