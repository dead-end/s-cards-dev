<script>
  import { onMount } from 'svelte';
  import { RegistryStore } from './stores/registryStore';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import Registry from './components/Registration.svelte';

  onMount(RegistryStore.load);
</script>

<div class="container">
  <Header />

  <main>
    {#each $RegistryStore as registration}
      <Registry {registration} />
    {/each}
  </main>

  <Footer />
</div>

<style>
</style>
