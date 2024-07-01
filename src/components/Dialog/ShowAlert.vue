<script setup lang="ts">
import { computed } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { storeToRefs } from 'pinia'

const props = defineProps({
  dialog: {
    type: Boolean,
    required: true
  },
  icon: {
    type: String,
    required: false
  },
  text: {
    type: String,
    required: false
  }
})

// Pinia Vuex
const dialogStore = useDialogStore()
const { dialogStatus } = storeToRefs(dialogStore)

// 根据 icon 属性获取相应的颜色类名
const color = computed(() => {
  switch (props.icon) {
    case 'fail':
      return 'error'
    case 'done':
      return 'success'
    case 'favorite':
      return 'successt'
    case 'unfavorite':
      return 'info'
    default:
      return ''
  }
})

const icons = {
  failIcon: 'mdi-close-circle',
  doneIcon: 'mdi-check-circle',
  favoriteIcon: 'mdi-heart',
  unfavoriteIcon: 'mdi-heart-outline'
}

// 根据 icon 属性获取相应的图标 URL
const iconUrl = computed(() => {
  switch (props.icon) {
    case 'fail':
      return icons.failIcon
    case 'done':
      return icons.doneIcon
    case 'favorite':
      return icons.favoriteIcon
    case 'unfavorite':
      return icons.unfavoriteIcon
    default:
      return ''
  }
})

// 關閉 Dialog
const closeDialog = () => {
  dialogStore.hideAlert()
}
</script>

<template>
  <v-dialog
    v-model="dialogStatus"
    persistent
    max-width="180"
    @click:outside="closeDialog"
  >
    <v-card
      height="96px"
      class="d-flex align-center justify-center flex-column"
    >
      <v-icon :color="color" size="small">{{ iconUrl }}</v-icon>
      <span v-show="text" class="mt-2 px-2 subtitle-2 text-center textw--text"
        >{{ text }}
      </span>
    </v-card>
  </v-dialog>
</template>
