# UI Ton Wallet

基於 Typescript + Eslint + Prettier + Vitest(測試) + Pinia 的 Vue3 專案

## 環境要求

- Node.js 版本 >= 18.0.0

### 使用 NVM 切换 Node.js 版本

1. 安装 [NVM](https://github.com/nvm-sh/nvm)
2. 在项目根目录下运行 `nvm use` 切换到项目要求的 Node.js 版本 (可查看專案目錄下的 `.nvmrc` 設定的版本)
3. 如果没有安装指定版本的 Node.js，运行 `nvm install 18.8.0`

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

## Component

### Alert

```javascript
<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog'

const dialogStore = useDialogStore()

dialogStore.showAlert({ icon: 'fail', text: '請重新登入' });
dialogStore.showAlert({ icon: 'done', text: '成功' });
dialogStore.showAlert({ icon: 'favorite', text: '收藏成功' });
dialogStore.showAlert({ icon: 'unfavorite', text: '取消收藏成功' });
</script>
```
