const message = {
  common: {
    success: '成功',
    fail: (res: { code: string, message: string }) => {
      return res.code && res.message ? res.code + res.message : '发生错误'
    }
  },
  withdrawal: {
    success: '取款申请成功'
  },
  deposit: {
    success: ''
  },

  copy: {
    success: '钱包地址已复制到剪贴板'
  }
}
export default message