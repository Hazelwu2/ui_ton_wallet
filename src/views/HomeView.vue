<script setup lang="ts">
// Component
import Navbar from '@/components/Navbar.vue'
import Alert from '@/components/Dialog/ShowAlert.vue'
import GameList from '@/components/GameList/GameList.vue'
// Pinia
import { useDialogStore } from '@/stores/dialog'
const dialogStore = useDialogStore()
</script>

<template>
  <main>
    <Alert
      class="alert"
      :dialog="dialogStore.dialogStatus"
      :icon="dialogStore.icon"
      :text="dialogStore.text"
    />
    <Navbar />

    <GameList />
  </main>
</template>
