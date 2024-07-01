import { defineStore } from 'pinia'

interface DialogState {
  dialogStatus: boolean
  icon: string
  text: string
}

export const useDialogStore = defineStore('dialog', {
  state: (): DialogState => ({
    dialogStatus: false,
    icon: '',
    text: ''
  }),

  actions: {
    showAlert({ icon, text }: { icon: string; text: string }) {
      this.dialogStatus = true
      this.icon = icon
      this.text = text
    },

    hideAlert() {
      this.dialogStatus = false
      this.icon = ''
      this.text = ''
    }
  }
})
