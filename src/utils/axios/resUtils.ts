export interface CustomAxiosResponse<T = any> {
  code?: string
  message?: string
  trace?: string
  result?: T
}

const noFunction = (data: any) => data

export const handleResponse = (
  res: CustomAxiosResponse,
  successFn: any = noFunction,
  errorFn: any = noFunction
) => {
  if (res.code === '0') {
    successFn(res)
  } else {
    errorFn(res)
  }
}

// const ifNofunction = (data) => {
//   return data
// }

// export const resStatus = (
//   resData,
//   ifStatus1Todo = ifNofunction,
//   isStatus0Todo = ifNofunction,
//   windowObj = null
// ) => {
//   const { data, errors } = resData
//   if (!resData) return false
//   if (errors) return isStatus0Todo(errors[0])
//   ifStatus1Todo(data, windowObj)
// }
