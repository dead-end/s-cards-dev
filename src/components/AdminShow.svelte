<script lang="ts">
  import type { Admin } from '../js/admin';

  export let admin: Admin;
</script>

<table>
  <tr>
    <td>Github URL Language</td>
    <td>{admin.langUrl}</td>
  </tr>
  <tr>
    <td>Github URL Backup</td>
    <td>{admin.backupUrl ? admin.backupUrl : ''}</td>
  </tr>
  <tr>
    <td>Github File</td>
    <td>{admin.file ? admin.file : ''}</td>
  </tr>
  <tr>
    <td>Token</td>
    <td>
      {#if admin.token}
        ...{admin.token.substring(admin.token.length - 3)}
      {/if}
    </td>
  </tr>
</table>
