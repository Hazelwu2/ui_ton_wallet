<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import FIN_MIND_API from '@/api/finmind'
import dayjs from 'dayjs'
import symbolList from '@/utils/stock/symbol'
// Dialog
import Alert from '@/components/Dialog/ShowAlert.vue'

// Pinia Vuex
const userStore = useUserStore()
const dialogStore = useDialogStore()

const selectedStock = ref<string | null>(null)
const search = ref('')
const stockAmount = ref(0)
const numberOfShares = ref<number>(10)
const loanPercentage = ref<number>(60)
const loading = ref<boolean>(false)
const showLoanAmount = ref<boolean>(false)
const showCutOffAmount = ref<boolean>(false)
const loanAmount = ref<number>(0)
const totalPrice = ref<number>(0)
const cutOffAmount = ref<number>(0)
const maintenanceRate = ref<number>(130)
// 股票昨日收價價格
const openPrice = ref<number>(0)

// 目前擔保品總價值
const totalCollateral = ref<number>(0)
// 借貸總金額
const totalAmountBorrowed = ref<number>(0)
// 質押張數
const numberOfPledgedSheets = ref<number>(11)

const filteredStocks = computed(() => {
  return symbolList.filter((stock) =>
    stock.toLowerCase().includes(search.value.toLowerCase())
  )
})

// 計算維持率
const calculateLoanMaintenanceRate = computed(() => {
  // 擔保品總價值 / 要借的總金額
  return (
    ((stockAmount.value * numberOfShares.value * 1000) /
      loanAmount.value) *
    100
  )
})
const calculateLoan = async () => {
  const hasSelectedStock = selectedStock.value
  const hasNumberOfShares = numberOfShares.value

  if (hasSelectedStock && hasNumberOfShares) {
    showLoanAmount.value = true

    // 股價總金額
    totalPrice.value =
      stockAmount.value * numberOfShares.value * 1000

    // console.error('股價總金額：', totalPrice)
    // console.error('借款成數', loanPercentage.value * 0.01)

    // 可借款總金額 = 股價總金額 * 借款成數
    loanAmount.value =
      totalPrice.value * (loanPercentage.value * 0.01)

    // 順便計算股票跌至多少
    // 設定股票總價值
    totalCollateral.value = parseInt(
      totalPrice.value.toFixed(0)
    )

    // 設定借款金額
    totalAmountBorrowed.value = parseInt(
      loanAmount.value.toFixed(0)
    )

    // 設定質押張數
    numberOfPledgedSheets.value = numberOfShares.value
    calculateStockPrice()

    dialogStore.showAlert({
      icon: 'done',
      text: `
        股價總價格 ${totalPrice.value.toFixed(0)} 元，可借金額 ${loanAmount.value.toFixed(0)} 元，維持率為 ${calculateLoanMaintenanceRate.value.toFixed(0)} %。
        跌到 ${cutOffAmount.value.toFixed(2)}，需要追繳錢
        `
    })
  } else {
    showLoanAmount.value = false
    dialogStore.showAlert({
      icon: 'fail',
      text: `無法試算，請填寫完整資料！`
    })
  }
}

// 取得股價
const fetchStockRealPrice = async () => {
  console.error('取得股價！')
  const dataest = 'dataset=TaiwanStockPrice'
  const date = 'YYYY-MM-DD'

  // 取得開始時間
  const getStartDate = () => {
    const now = dayjs()
    const marketCloseTime = now.hour(14).minute(0).second(0)

    let start_date
    if (now.isAfter(marketCloseTime)) {
      start_date = now.format(date)
    } else {
      start_date = now.subtract(3, 'day').format(date)
    }

    return start_date
  }

  const start_date = `start_date=${getStartDate()}`
  const end_date = `end_date=${dayjs().add(1, 'day').format(date)}`
  const token = `token=${userStore.stockToken}`

  const stockNum = selectedStock.value?.split(' ')[0]
  const data_id = `data_id=${stockNum}`

  try {
    loading.value = true
    const res = await fetch(
      `${FIN_MIND_API.getDataAPI}?${token}&${dataest}&${start_date}&${end_date}&${data_id}`,
      {
        method: 'GET'
      }
    )

    const data = await res.json()
    loading.value = false

    if (data.msg && data.msg === 'success') {
      if (data.data.length > 0) {
        stockAmount.value = data.data[0].close
        openPrice.value = data.data[0].open
      } else {
        dialogStore.showAlert({
          icon: 'fail',
          text: `取得前一日或當日${selectedStock.value} 價格失敗哩 T_T`
        })
      }
    }
  } catch (error) {
    console.error(error)
    dialogStore.showAlert({
      icon: 'fail',
      text: `取得前一日或當日${selectedStock.value} 價格失敗哩 T_T`
    })
  } finally {
    loading.value = false
  }
}

const calculateStockPrice = () => {
  // dangerPrice(會被斷頭的總市值) = 借貸金額 * 130%維持率
  const dangerPrice = totalAmountBorrowed.value * 1.3
  // totalCollateral
  // 追繳股價 = 會被斷頭的股票總市值 / 質押張數
  showCutOffAmount.value = true
  cutOffAmount.value =
    dangerPrice / numberOfPledgedSheets.value / 1000

  dialogStore.showAlert({
    icon: 'done',
    text: `股票需跌至 ${cutOffAmount.value.toFixed(2)}，需追繳錢`
  })
}

const initData = async () => {
  try {
    const formData = new FormData()
    formData.append('user_id', 'helloworld')
    formData.append('password', '5i5x79cSh40T')
    const response = await fetch(
      'https://api.finmindtrade.com/api/v4/login',
      {
        method: 'POST',
        body: formData
      }
    )
    const data = await response.json()

    if (data.status === 200) {
      userStore.handleToken(data.token)
    } else {
      dialogStore.showAlert({
        icon: 'fail',
        text: data.msg
      })
    }
  } catch (error) {
    console.error(
      'Failed to fetch Find Mind Trade Login:',
      error
    )
  }
}

onMounted(() => {
  if (!userStore.stockToken) initData()
})
</script>

<template>
  <main>
    <Alert
      class="alert"
      :dialog="dialogStore.alertStatus"
      :icon="dialogStore.icon"
      :text="dialogStore.text"
    />

    <v-container>
      <v-row>
        <v-col cols="12">
          <div></div>
        </v-col>
        <v-col cols="12">
          <v-card>
            <v-card-title class="mb-2">
              <h4 class="font-weight-regular">
                我的股票能<span class="font-weight-bold"
                  >借多少錢</span
                >
              </h4>
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="calculateLoan">
                <v-autocomplete
                  v-model="selectedStock"
                  :items="filteredStocks"
                  :loading="loading"
                  v-model:search-input="search"
                  item-text="name"
                  item-value="symbol"
                  label="輸入股票代碼"
                  placeholder="請輸入股票代碼"
                  clearable
                  outlined
                  @keydown.enter.stop
                  @blur="fetchStockRealPrice"
                />

                <!-- 股票現價 -->
                <v-text-field
                  v-model.number="stockAmount"
                  label="股票現價"
                  outlined
                  disabled
                  type="number"
                />

                <v-text-field
                  v-model.number="numberOfShares"
                  label="張數"
                  type="number"
                  outlined
                  required
                />

                <v-slider
                  v-model="loanPercentage"
                  label="借款成數"
                  thumb-label="always"
                  min="20"
                  max="60"
                  step="10"
                />

                <div class="text-center">
                  <v-btn
                    color="primary"
                    @click="calculateLoan"
                    :disabled="stockAmount === 0"
                    >開始試算
                  </v-btn>
                </div>
              </v-form>

              <v-divider color="info" class="mt-4 mb-4" />

              <div class="mt-2 mb-2">
                <div
                  class="d-flex flex-row align-center justify-center"
                >
                  <div class="mr-4">
                    <img
                      src="/images/calc-icon.svg"
                      alt=""
                    />
                  </div>

                  <!-- 可借金額 -->
                  <div>
                    <div
                      class="title font-weight-bold text-subtitle-1"
                    >
                      可借金額
                    </div>
                    <div
                      class="calc-result font-weight-bold text-subtitle-1"
                    >
                      <span
                        class="num highlight text-orange text-h5"
                        color="orange"
                      >
                        {{ loanAmount.toFixed(0) }}
                      </span>
                      元
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    class="d-flex flex-row align-center justify-center"
                  >
                    <div
                      class="font-weight-regular text-subtitle-1 mr-2"
                    >
                      昨收價
                      <span
                        class="price text-green-light font-weight-bold text-h5"
                        >{{ openPrice }}</span
                      >
                      元
                    </div>
                    <div
                      class="font-weight-regular text-subtitle-1"
                    >
                      借款成數
                      <span
                        class="price text-green-light font-weight-bold text-h5"
                        >{{ loanPercentage }}</span
                      >
                      %
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!--  -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="mb-2">
              <h4 class="font-weight-regular">
                回推股價<span class="font-weight-bold"
                  >跌到多少會收到追繳通知</span
                >
              </h4>
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="calculateLoan">
                <!-- 目前擔保品總價值 -->
                <v-text-field
                  v-model.number="totalCollateral"
                  label="目前擔保品總價值"
                  outlined
                  type="number"
                />

                <v-text-field
                  v-model.number="totalAmountBorrowed"
                  label="借款總金額"
                  type="number"
                  outlined
                  required
                />

                <v-text-field
                  v-model="maintenanceRate"
                  disabled
                  label="維持率(%)"
                  type="number"
                  outlined
                  required
                />

                <v-slider
                  v-model="numberOfPledgedSheets"
                  thumb-label="always"
                  label="質押張數"
                  min="1"
                  max="30"
                  step="1"
                />

                <div class="text-center">
                  <v-btn
                    color="primary"
                    @click="calculateStockPrice"
                    >開始試算
                  </v-btn>
                </div>
              </v-form>

              <v-divider color="info" class="mt-2 mb-2" />

              <div class="mt-2 mb-2">
                <div
                  class="d-flex flex-row align-center justify-center"
                >
                  <div class="mr-4">
                    <img
                      src="/images/calc-icon.svg"
                      alt=""
                    />
                  </div>
                  <!-- 可借金額 -->
                  <div>
                    <div
                      class="title font-weight-bold text-subtitle-1"
                    >
                      股票跌至
                    </div>
                    <div
                      class="calc-result font-weight-bold text-subtitle-1"
                    >
                      <span
                        class="num highlight text-orange text-h5"
                        color="orange"
                      >
                        {{ cutOffAmount.toFixed(2) }}
                      </span>
                      元需要追繳錢
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<style scoped lang="scss">
/* Add your custom styles here */
.highlight {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    display: block;
    background-color: #fff6a8;
    width: 100%;
    height: 20px;
    bottom: 0;
    z-index: -1;
  }
}

.text-green-light {
  line-height: 160%;
  letter-spacing: 0.1em;
  color: #55c4a8;
}
</style>
