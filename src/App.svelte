<script>
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import TopicList from './components/TopicList.svelte';
</script>

<div class="container">
  <Header />

  <div id="main" class="block">
    <TopicList />
  </div>

  <Footer />
</div>

<style>
</style>
