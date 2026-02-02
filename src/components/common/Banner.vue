<template>
  <swiper
    class="banner"
    :indicator-dots="true"
    :autoplay="true"
    :interval="3000"
    :duration="500"
    indicator-color="rgba(255, 255, 255, 0.5)"
    indicator-active-color="#FFFFFF"
  >
    <swiper-item v-for="(item, index) in items" :key="index">
      <view class="banner-item" :style="{ backgroundColor: item.bgColor }">
        <view class="banner-content">
          <view class="banner-title">{{ item.title }}</view>
          <view class="banner-desc">{{ item.desc }}</view>
        </view>
      </view>
    </swiper-item>
  </swiper>
</template>

<script setup lang="ts">
export interface BannerItem {
  title: string
  desc: string
  bgColor: string
  image?: string
}

withDefaults(defineProps<{
  items: BannerItem[]
}>(), {
  items: () => []
})
</script>

<style lang="scss" scoped>

.banner {
  width: 100%;
  height: 240rpx;
  border-radius: $radius-md;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  text-align: center;
  color: #FFFFFF;
}

.banner-title {
  font-size: $font-size-xl;
  font-weight: bold;
  margin-bottom: $spacing-xs;
}

.banner-desc {
  font-size: $font-size-md;
  opacity: 0.9;
}
</style>
