<template>
  <view class="index">
    <nut-calendar-card></nut-calendar-card>
    <nut-grid :gutter="8">
      <nut-grid-item class="item" v-for="(tool) of tools" :key="tool.id" @click="navTo(tool.path)">
        <cover-image class='icon' :src='tool.icon'/>
        <text class='name'>{{ tool.name }}</text>
      </nut-grid-item>
    </nut-grid>
  </view>
</template>

<script>
import './index.scss'
import {useTools} from "../../stores/tools";
import {CoverImage} from '@tarojs/components'
import Taro from "@tarojs/taro";

export default {
  name: 'ToolIndex',
  components: {CoverImage},
  setup() {
    const toolsStore = useTools()
    return {toolsStore}
  },
  computed: {
    tools() {
      return this.toolsStore.tools;
    }
  },
  methods: {
    navTo(path) {
      Taro.navigateTo({
        url: path
      })
    }
  }

}
</script>
