<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useDialogStore } from '@/stores/dialog'
import { handleResponse } from '@/utils/axios/apiUtils'
import type { GameList } from '@/api/game'

// Pinia Vuex
const gameStore = useGameStore()
const dialogStore = useDialogStore()

// Data
const gameList = ref<GameList[]>([])
const defaultImage = ref(
  'https://www.inprohub.vip/uploads/images/8f9464f859916bf88d575885e61994d6.jpg'
)

const launchGame = async (game_code: string) => {
  console.log('啟動遊戲:', game_code)
  const res = await gameStore.launchGame(game_code)
  handleResponse(res, launchGameSuccess, getGameListFail)
}

const getGameList = async () => {
  const res = await gameStore.getGameList()
  handleResponse(res, getGameListSuccess(res), getGameListFail)
}

const getGameListSuccess = (res: any) => {
  if (Array.isArray(res?.result?.data) && res?.result?.data.length > 0) {
    for (let i = 0; i < res?.result.data.length; i++) {
      gameList.value.push(res.result.data[i])
    }
  }
}
const getGameListFail = (res) => {
  console.log('res', res)
  dialogStore.showAlert({
    icon: 'fail',
    text: res.code + res.message
  })
}
const launchGameSuccess = (gameUrl: string) => {
  const windowObj = window.open('', '_blank')
  if (!windowObj) throw new Error('windowObj 是 null')

  windowObj.location.href = gameUrl
}

onMounted(async () => {
  // TODO: 懶加載
  await getGameList()
  gameStore.page_num++
  await getGameList()
})
</script>

<template>
  <v-row class="py-2 mt-4">
    <!-- {{ gameList }} -->
    <v-col
      cols="4"
      v-for="game in gameList"
      :key="game?.launch_code"
      class="px-1 py-1"
    >
      <div class="overflow-hidden shadow-round-container">
        <!-- 遊戲圖片 -->
        <v-img
          :src="game?.pic ? game.pic : defaultImage"
          height="110"
          class="rounded"
          @click="launchGame(game.launch_code)"
        >
          <!-- <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="primary" />
            </v-row>
          </template> -->
        </v-img>

        <!-- 遊戲敘述 -->
        <div class="description d-flex align-center py-2">
          <span class="description__name subtitle-2">
            {{ game?.name }}
          </span>
          <v-spacer />
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
.description {
  &__name {
    width: 100%;
    text-align: center;
  }
}
</style>
