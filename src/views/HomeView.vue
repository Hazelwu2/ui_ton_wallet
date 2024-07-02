<script setup lang="ts">
// Component
import AppNavbar from '@/components/AppNavbar.vue'
import GameList from '@/components/GameList/GameList.vue'
// Dialog
import Alert from '@/components/Dialog/ShowAlert.vue'
import DepositDialog from '@/components/Dialog/DepositDialog.vue'
import WithdrawalDialog from '@/components/Dialog/WithdrawalDialog.vue'
// import ProfileDialog from '@/components/Dialog/ProfileDialog.vue'
// Pinia
import { storeToRefs } from 'pinia'
import { useDialogStore } from '@/stores/dialog'

const dialogStore = useDialogStore()
const { showDepositDialog, showWithdrawalDialog } =
  storeToRefs(dialogStore)
</script>

<template>
  <main>
    <Alert
      class="alert"
      :dialog="dialogStore.alertStatus"
      :icon="dialogStore.icon"
      :text="dialogStore.text"
    />
    <AppNavbar />

    <GameList />

    <!-- 存款、取款、個人資料燈箱 Start -->
    <v-dialog v-model="showDepositDialog" max-width="600">
      <DepositDialog />
    </v-dialog>

    <v-dialog
      v-model="showWithdrawalDialog"
      max-width="600"
    >
      <WithdrawalDialog />
    </v-dialog>

    <!-- <v-dialog
      v-model="dialogStore.showProfileDialog"
      max-width="600"
    >
      <template #activator="{ on }">
        <v-btn
          v-on="on"
          @click="dialogStore.switchProfileDialog"
          >個人資料
        </v-btn>
      </template>
      <ProfileDialog />
    </v-dialog> -->
    <!-- 存款、取款、個人資料燈箱 End -->
  </main>
</template>
