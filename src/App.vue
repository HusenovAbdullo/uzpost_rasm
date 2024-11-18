<template>
  <router-view /> <!-- Router orqali sahifalarni ko'rsatish -->
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  
  /* Barcha tomonga -8px siljitish */
  margin: -8px; 
}
</style>