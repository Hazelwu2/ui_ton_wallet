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
const numberOfShares = ref<number>(5)
const loanPercentage = ref<number>(60)
const loading = ref<boolean>(false)
const showLoanAmount = ref<boolean>(false)
const showCutOffAmount = ref<boolean>(false)
const loanAmount = ref<number>(0)
const totalPrice = ref<number>(0)
const cutOffAmount = ref<number>(0)
const maintenanceRate = ref<number>(130)

// 用於顯示詳細結果的對話框
const showResultDialog = ref<boolean>(false)
const resultMessage = ref<string>('')

// 股票昨日收價價格
const openPrice = ref<number>(0)

// 目前擔保品總價值
const totalCollateral = ref<number>(0)
// 借貸總金額
const totalAmountBorrowed = ref<number>(0)
// 質押張數
const numberOfPledgedSheets = ref<number>(5)

// 利息計算部分，預設年利率 2.68%
const annualInterestRate = ref<number>(2.68)
const monthlyInterest = computed(() => {
  return (
    (totalAmountBorrowed.value *
      (annualInterestRate.value / 100)) /
    12
  ).toFixed(0)
})
const yearlyInterest = computed(() => {
  return (
    totalAmountBorrowed.value *
    (annualInterestRate.value / 100)
  ).toFixed(0)
})

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

    // 使用v-dialog替代alert顯示試算結果
    showResultDialog.value = true
    resultMessage.value = `根據您輸入的資料，股票價值 ${totalPrice.value.toLocaleString()} 元，可借金額 ${loanAmount.value.toLocaleString()} 元。
    
維持率為 ${calculateLoanMaintenanceRate.value.toFixed(0)}%，當股票跌至 ${cutOffAmount.value.toFixed(2)} 元時，您將收到追繳通知。
    
每月需支付利息約 ${monthlyInterest.value} 元。`
  } else {
    showLoanAmount.value = false
    dialogStore.showAlert({
      icon: 'fail',
      text: `無法試算，請填寫完整資料！`
    })
  }
}

// 取得股價
const fetchStockRealPrice = async (
  retryCount = 0,
  maxRetries = 10
): Promise<void> => {
  console.error('取得股價！')
  const dataest = 'dataset=TaiwanStockPrice'
  const date = 'YYYY-MM-DD'

  // 取得開始時間
  const getStartDate = () => {
    // const now = dayjs()
    const now = dayjs('2025-04-06')
    const marketCloseTime = now.hour(14).minute(0).second(0)

    // 基本日期計算，如果現在時間在市場收盤後就用今天，否則用3天前
    // 重試時，每次往前多一天
    let daysToSubtract =
      retryCount + (now.isAfter(marketCloseTime) ? 0 : 3)

    // 考慮周末情況
    console.log('daysToSubtract', daysToSubtract)
    const targetDate = now.subtract(daysToSubtract, 'day')
    const dayOfWeek = targetDate.day() // 0是週日，6是週六

    // 如果是週末，則再往前調整
    if (dayOfWeek === 0) {
      daysToSubtract += 2 // 週日再往前 2 天到週五
    } else if (dayOfWeek === 6) {
      daysToSubtract += 1 // 週六再往前 1 天到週五
    }

    return now.subtract(daysToSubtract, 'day').format(date)
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
        // 資料為空（可能是假日或連假），嘗試往前查詢
        if (retryCount < maxRetries) {
          console.error(
            `${selectedStock.value} 在指定日期無資料，可能為假日，嘗試往前查詢（第 ${retryCount + 1} 次重試）`
          )
          return fetchStockRealPrice(
            retryCount + 1,
            maxRetries
          )
        } else {
          dialogStore.showAlert({
            icon: 'fail',
            text: `無法取得 ${selectedStock.value} 價格資料，已嘗試多次查詢。`
          })
        }
      }
    }
  } catch (error) {
    console.error(error)
    if (retryCount < maxRetries) {
      console.error(
        `查詢 ${selectedStock.value} 時發生錯誤，嘗試往前查詢（第 ${retryCount + 1} 次重試）`
      )
      return fetchStockRealPrice(retryCount + 1, maxRetries)
    } else {
      dialogStore.showAlert({
        icon: 'fail',
        text: `取得${selectedStock.value}價格失敗，請稍後再試。`
      })
    }
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

  // 使用v-dialog替代alert顯示試算結果
  showResultDialog.value = true
  resultMessage.value = `股票跌至 ${cutOffAmount.value.toFixed(2)} 元時，將收到追繳通知。目前試算結果：
每月利息約 ${monthlyInterest.value} 元，一年總利息約 ${yearlyInterest.value} 元。
所有詳細資訊已更新在下方。`
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

    <!-- 結果詳細對話框 -->
    <v-dialog v-model="showResultDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pb-2">
          <v-icon color="green" class="mr-2"
            >mdi-check-circle</v-icon
          >
          試算結果
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4 text-body-1">
          <div style="white-space: pre-line">
            {{ resultMessage }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="showResultDialog = false"
          >
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
                  @update:model-value="
                    (val: string) =>
                      val && fetchStockRealPrice()
                  "
                  return-object
                />

                <!-- 股票現價 -->
                <v-text-field
                  v-model.number="stockAmount"
                  label="股票現價"
                  outlined
                  :hint="
                    stockAmount > 0
                      ? `取得到 ${selectedStock} 的最新價格`
                      : '請選擇股票'
                  "
                  persistent-hint
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

                <v-text-field
                  v-model.number="annualInterestRate"
                  label="年利率(%)"
                  placeholder="請輸入年利率，預設2.68%"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  hint="請輸入年利率百分比，例如：2.68"
                  persistent-hint
                  outlined
                />

                <div class="text-center mb-5 mt-5">
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

                <!-- 利息顯示區塊 -->
                <div
                  class="mt-4"
                  v-if="totalAmountBorrowed > 0"
                >
                  <div class="interest-card pa-4">
                    <div
                      class="text-h6 font-weight-bold mb-3"
                    >
                      利息計算
                    </div>

                    <div
                      class="d-flex flex-column flex-md-row justify-space-between mb-4"
                    >
                      <div
                        class="interest-box pa-3 mb-3 mb-md-0 mr-md-2"
                      >
                        <div
                          class="text-subtitle-1 font-weight-bold mb-1"
                        >
                          月利息
                        </div>
                        <div
                          class="text-orange font-weight-bold text-h5"
                        >
                          {{ monthlyInterest }} 元
                        </div>
                        <div
                          class="text-caption text-grey mt-2"
                        >
                          計算方式：借款金額 × 年利率 ÷
                          12個月
                        </div>
                        <div
                          class="text-caption text-grey-darken-1"
                        >
                          {{
                            totalAmountBorrowed.toLocaleString()
                          }}
                          × {{ annualInterestRate }}% ÷ 12 =
                          {{ monthlyInterest }} 元
                        </div>
                      </div>

                      <div
                        class="interest-box pa-3 ml-md-2"
                      >
                        <div
                          class="text-subtitle-1 font-weight-bold mb-1"
                        >
                          年利息
                        </div>
                        <div
                          class="text-orange font-weight-bold text-h5"
                        >
                          {{ yearlyInterest }} 元
                        </div>
                        <div
                          class="text-caption text-grey mt-2"
                        >
                          計算方式：借款金額 × 年利率
                        </div>
                        <div
                          class="text-caption text-grey-darken-1"
                        >
                          {{
                            totalAmountBorrowed.toLocaleString()
                          }}
                          × {{ annualInterestRate }}% =
                          {{ yearlyInterest }} 元
                        </div>
                      </div>
                    </div>

                    <div
                      class="text-caption text-grey-darken-2 mt-2 pa-2 bg-grey-lighten-4 rounded"
                    >
                      <strong>注意：</strong>
                      實際利息可能因計息方式、計息期間、本金變動等因素而有所不同。請以金融機構實際核定為準。
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

.interest-card {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.interest-box {
  border: 1px solid #e9e9e9;
  border-radius: 8px;
  background-color: white;
  flex: 1;
  transition: all 0.2s ease;
}

.interest-box:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d0d0d0;
}

.text-orange {
  color: #ff9800;
}
</style>
