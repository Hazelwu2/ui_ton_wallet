<template>
  <v-dialog v-model="status" persistent max-width="180">
    <v-card
      height="96px"
      class="d-flex align-center justify-center flex-column popupbg containerStyle"
    >
      <!-- <Icon v-if="iconUrl" :data="iconUrl" width="32px" height="32px" :class="color" /> -->
      <v-icon color="success" icon="mdi-alert" size="small"> </v-icon>
      <!-- alert 不顯示文字 -->
      <span v-show="text" class="mt-2 px-2 subtitle-2 text-center textw--text">{{ text }} </span>
    </v-card>
  </v-dialog>
</template>

<script>
import fail from '@/assets/icons/alert/error.svg'
import done from '@/assets/icons/alert/done.svg'
import favorite from '@/assets/icons/favorite.svg'
import unfavorite from '@/assets/icons/unfavorite.svg'

export default {
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    /* eslint-disable */
    icon: {
      type: String
    },
    /* eslint-disable */
    text: {
      type: String,
      required: false
    }
  },
  data: () => ({
    fail,
    done,
    favorite,
    unfavorite
  }),

  computed: {
    color() {
      switch (this.icon) {
        case 'fail':
          return 'danger--text'

        case 'done':
          return 'primary--text'

        case 'favorite':
          return 'danger--text'

        case 'unfavorite':
          return 'textfield--text'

        default:
          break
      }
    },
    iconUrl() {
      return this[this.icon]
    },

    // Dialog 狀態
    status: {
      get() {
        return this.dialog
      },
      set(newStatus) {
        this.$emit('update-dialog', newStatus)
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
