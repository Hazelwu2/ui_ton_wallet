<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { handleResponse } from '@/utils/axios/resUtils'
import type {
  GameList,
  GameListResponse,
  LaunchGameResponse
} from '@/api/game'

// Pinia Vuex
const gameStore = useGameStore()
const dialogStore = useDialogStore()
const userStore = useUserStore()

const { ifUserIsLogin } = userStore
const { showAlert } = dialogStore

// Data
const gameList = ref<GameList[]>([])
const gameListContainer = ref<HTMLElement | null>(null)

// 預設遊戲封面
const defaultImages = [
  '/images/game-cover1.jpg',
  '/images/game-cover2.jpg',
  '/images/game-cover3.jpg'
]

// 隨機產生 0,1,2 數字
const getRandomArrayElement = () => {
  const array = [0, 1, 2]
  const randomIndex = Math.floor(
    Math.random() * array.length
  )
  return array[randomIndex]
}

const getGameList = async () => {
  const res = await gameStore.getGameList()
  handleResponse(
    res as GameListResponse,
    getGameListSuccess,
    getGameListFail
  )
}

const getGameListSuccess = (res: any) => {
  if (
    Array.isArray(res?.result?.data) &&
    res?.result?.data.length > 0
  ) {
    gameList.value.push(...res.result.data)
  } else {
    removeScrollListener()
  }
}

const getGameListFail = (res: GameListResponse) => {
  dialogStore.showAlert({
    icon: 'fail',
    text:
      res?.code && res?.message
        ? res.code + res.message
        : ''
  })
}

const launchGame = async (
  launchCode: string | undefined
) => {
  if (!ifUserIsLogin()) {
    showAlert({
      icon: 'fail',
      text: '請先登入'
    })
    return
  }

  if (!launchCode)
    throw new Error('launchGame Fn 缺少參數 launchCode')

  const res = await gameStore.launchGame(launchCode)
  handleResponse(
    res as LaunchGameResponse,
    launchGameSuccess,
    launchGameFail
  )
}

const launchGameSuccess = (res: LaunchGameResponse) => {
  if (!res?.result || !res?.result.url) {
    throw new Error('launchGameSuccess res 沒有 result')
  }
  const windowObj = window.open('', '_blank')
  if (!windowObj) throw new Error('windowObj 是 null')

  windowObj.location.href = res.result.url
}

const launchGameFail = (res: LaunchGameResponse) => {
  if (!userStore.account) {
    dialogStore.showAlert({
      icon: 'fail',
      text: '請先登入'
    })
    return
  }

  if (res.code && res.message) {
    dialogStore.showAlert({
      icon: 'fail',
      text: res.code + res.message
    })
    return
  }

  dialogStore.showAlert({
    icon: 'fail',
    text: ''
  })
}

/**
 * 偵測滾動到底部的原理：
  1. scrollTop：滾動條距離頂部的距離。
  2. clientHeight：可見區域的高度。
  3. scrollHeight：滾動區域的總高度。

  當 scrollTop + clientHeight 等於或大於 scrollHeight 時
  表示已經滾動到底部。
 */

const onScroll = async () => {
  if (!gameListContainer.value) return

  const { scrollTop, clientHeight, scrollHeight } =
    gameListContainer.value

  // 偵測是否有滑到最底部
  if (scrollTop + clientHeight >= scrollHeight) {
    await getGameList()
  }
}

const addScrollListener = () => {
  if (gameListContainer.value) {
    gameListContainer.value.addEventListener(
      'scroll',
      onScroll
    )
  }
}

const removeScrollListener = () => {
  if (gameListContainer.value) {
    gameListContainer.value.removeEventListener(
      'scroll',
      onScroll
    )
  }
}

onMounted(async () => {
  await nextTick() // 確保 DOM 已經更新
  if (gameListContainer.value) {
    addScrollListener()
    // 重整後需要將頁數還原
    gameStore.page_num = 1
    await getGameList()
  }
})

onUnmounted(() => {
  removeScrollListener()
})
</script>

<template>
  <div class="game-list-container" ref="gameListContainer">
    <v-row class="py-2 mt-4">
      <v-col cols="12" class="px-1 py-1">
        <div
          class="banner overflow-hidden shadow-round-container"
          :style="{
            backgroundImage: `url('/images/xgd-banner.png')`
          }"
        >
          <div
            class="position-relative rounded"
            :style="{
              width: '100%',
              height: '100%'
            }"
          >
            <!-- 遊戲圖片 -->
            <v-img
              class="banner__img position-absolute rounded"
              :src="`/images/xgd-logo.png`"
            />
            <strong class="banner__text position-absolute">
              新高登棋牌
            </strong>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row class="py-2 mt-4">
      <v-col
        cols="6"
        sm="4"
        v-for="game in gameList"
        :key="game?.launch_code"
        class="px-1 py-1"
      >
        <div class="overflow-hidden shadow-round-container">
          <!-- 遊戲圖片 -->
          <v-img
            height="150"
            :src="
              game?.pic
                ? gameStore.path + game.pic
                : defaultImages[getRandomArrayElement()]
            "
            cover
            class="rounded"
            @click="launchGame(game?.launch_code)"
          >
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

      <v-col
        v-if="gameStore.scrollToBottom"
        cols="12"
        class="text-center"
      >
        <v-chip>已經滑到最底囉</v-chip>
      </v-col>
      <v-col
        v-else
        cols="6"
        sm="4"
        class="px-1 py-1 justify-center"
        v-for="i in 7"
        :key="i"
      >
        <div class="overflow-hidden shadow-round-container">
          <v-skeleton-loader
            max-width="270"
            :elevation="5"
            type="card"
          />
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
.description {
  &__name {
    width: 100%;
    text-align: center;
  }
}

.game-list-container {
  height: 80vh;
  overflow-y: auto;
}

.banner {
  background-size: cover;
  background-color: white;
  height: 110px;

  @media screen and (min-width: 568px) {
    background-size: cover;
    height: 180px;
  }

  &__img {
    width: 5rem;
    height: 5rem;
    left: 3rem;
    top: 0rem;

    @media screen and (min-width: 568px) {
      top: 30px;
      left: 7.5rem;
    }
  }

  &__text {
    font-size: 3vw;
    color: #333;
    top: 4.2rem;
    left: 4rem;

    @media screen and (min-width: 568px) {
      left: 110px;
      top: 100px;
    }
  }
}
</style>
