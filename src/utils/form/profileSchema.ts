import * as yup from 'yup'
// 驗證是否為 Ton 錢包
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

// 自定義驗證器：驗證是否為 TRC20 錢包地址
const isTRC20Address = (value: string) => {
  // TRC20 錢包地址應該以 "T" 開頭並且長度為 34
  const trc20AddressPattern = /^T[a-zA-Z0-9]{33}$/;
  return trc20AddressPattern.test(value);
};


// 定義驗證
export const ProfileSchema = yup.object({
  withdraw_wallet: yup
    .string()
    .required('TRC20 钱包地址是必须的')
    .max(34, '钱包地址不能超过34个字')
    .test('is-trc20', '无效的 TRC20 钱包地址', isTRC20Address)
  // .test('is-valid-address', '钱包地址格式错误', async (value) => {
  //   if (value) {
  //     const test = await addressValidate(value)
  //     return test
  //   }
  //   return true
  // })
})