import * as yup from 'yup'
// Define the async address validation function
const addressValidate = async (address: string) => {
  try {
    const response = await fetch(
      `https://testnet.toncenter.com/api/v2/detectAddress?address=${address}`
    )
    const data = await response.json()
    // console.log('data', data)

    if (!data.ok && data.error === "Incorrect address") {
      return false
      // throw new Error('錢包地址格式錯誤')
    }
    return true
  } catch (error) {
    console.error('Failed to validate address:', error)
    throw new Error('無法驗證錢包地址')
  }
}

// 定義驗證
export const ProfileSchema = yup.object({
  withdraw_ton_wallet: yup
    .string()
    .required('钱包地址是必须的')
    .max(48, '钱包地址不能超过48个字')
    .test('is-valid-address', '钱包地址格式错误', async (value) => {
      if (value) {
        const test = await addressValidate(value)
        return test
      }
      return true
    })
})