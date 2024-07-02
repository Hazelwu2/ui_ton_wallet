import { defineStore } from 'pinia'

interface DialogState {
  alertStatus: boolean
  icon: string
  text: string
  showDepositDialog: boolean
  showWithdrawalDialog: boolean
  showProfileDialog: boolean
}

export const useDialogStore = defineStore('dialog', {
  state: (): DialogState => ({
    alertStatus: false,
    // Global Show Icon & Message
    icon: '',
    text: '',
    // 存款、取款、個人資料燈箱
    showDepositDialog: false,
    showWithdrawalDialog: false,
    showProfileDialog: false
  }),

  actions: {
    showAlert({ icon, text }: { icon: string; text: string }) {
      this.alertStatus = true
      this.icon = icon
      this.text = text
    },

    hideAlert() {
      this.alertStatus = false
      this.icon = ''
      this.text = ''
    },

    // 存款燈箱
    switchDepositDialog() {
      this.showDepositDialog = !this.showDepositDialog
    },

    // 取款燈箱
    switchWithdrawalDialog() {
      this.showWithdrawalDialog = !this.showWithdrawalDialog
    },

    // 個人資料燈箱
    switchProfileDialog() {
      this.showProfileDialog = !this.showProfileDialog
    },
  }
})
