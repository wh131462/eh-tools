import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Grid, GridItem,Calendar,CalendarCard } from '@nutui/nutui-taro'
import "@nutui/nutui-taro/dist/style.css";

import './app.scss'
import {useTools} from "./stores/tools";
import {iTools} from "./app.tool";

const App = createApp({
  setup(){
    const toolStore = useTools();
    toolStore.addTool(iTools)
  },
  onShow(options) {
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

App.use(createPinia())
App.use(Grid)
App.use(GridItem)
App.use(Calendar)
App.use(CalendarCard)
export default App
