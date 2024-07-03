import * as yup from 'yup'

// 定義驗證
export const ProfileSchema = yup.object({
  withdraw_ton_wallet: yup
    .string()
    .required('錢包地址是必須的')
    .max(48, '錢包地址不能超過48個字')
})