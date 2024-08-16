import * as yup from 'yup'

// 定义验证
export const WithdrawalSchema = (userBalance: number) => {
  return yup.object({
    transfer_amount: yup
      .number()
      .typeError('转帐金额必须是数字')
      .required('转帐金额为必填')
      .moreThan(0, '转帐金额不可为 0')
      .min(0.1, '转帐金额最低至少要 0.1'),
    // .max(userBalance, `转帐金额不可超过目前餘額 ${userBalance}`),
    withdraw_wallet: yup
      .string()
      .required('TRC20 钱包地址是必须的')
      .max(34, '钱包地址不能超过34个字')
  })
}



