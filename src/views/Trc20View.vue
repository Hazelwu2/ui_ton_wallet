<script setup lang="ts">
// Component
import AppNavbar from '@/components/AppNavbar.vue'
// Dialog
import Alert from '@/components/Dialog/ShowAlert.vue'
import DepositDialog from '@/components/Dialog/DepositDialog.vue'
import WithdrawalDialog from '@/components/Dialog/WithdrawalDialog.vue'
import ProfileDialog from '@/components/Dialog/ProfileDialog.vue'
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

    <v-dialog
      v-model="dialogStore.showProfileDialog"
      max-width="600"
    >
      <ProfileDialog />
    </v-dialog>

    <iframe src="https://hazelwu.com"></iframe>
    <!-- 存款、取款、個人資料燈箱 End -->
  </main>
</template>
