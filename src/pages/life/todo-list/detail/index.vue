<template>
  <view class="todo-detail-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <nav-bar :title="currentList?.name || t('todoList.title')" />

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view
        v-for="tab in filterTabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentFilter === tab.key }"
        @click="currentFilter = tab.key"
      >
        <text>{{ tab.label }}</text>
        <text class="tab-count">{{ tab.count }}</text>
      </view>
    </view>

    <!-- 待办列表 -->
    <view class="items-container">
      <!-- 空状态 -->
      <view v-if="filteredItems.length === 0" class="empty-state">
        <view class="empty-icon">
          <image
            class="icon-image"
            src="/static/icons/check-circle.svg"
            mode="aspectFit"
          />
        </view>
        <text class="empty-title">{{ t('todoList.emptyItems') }}</text>
        <text class="empty-desc">{{ t('todoList.emptyItemsDesc') }}</text>
      </view>

      <!-- 待办项 -->
      <view
        v-for="item in filteredItems"
        :key="item.id"
        class="todo-item"
        :class="{ completed: item.completed }"
        @longpress="showDeleteItem(item)"
      >
        <view
          class="checkbox"
          :class="{ checked: item.completed }"
          @click="toggleItem(item)"
        >
          <text v-if="item.completed" class="check-icon">✓</text>
        </view>
        <text class="item-text">{{ item.text }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="input-wrapper">
        <input
          v-model="newItemText"
          class="item-input"
          :placeholder="t('todoList.itemPlaceholder')"
          @confirm="addItem"
        />
        <view class="add-item-btn" @click="addItem">
          <text class="btn-icon">+</text>
        </view>
      </view>
      <view
        v-if="completedCount > 0"
        class="clear-btn"
        @click="clearCompleted"
      >
        <text>{{ t('todoList.clearCompleted') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store/modules/settings'
import { storage, STORAGE_KEYS } from '@/utils/storage'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 待办项接口
interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

interface TodoList {
  id: string
  name: string
  bgColor: string
  items: TodoItem[]
  createdAt: number
}

const listId = ref('')
const currentList = ref<TodoList | null>(null)
const newItemText = ref('')
const currentFilter = ref<'all' | 'todo' | 'done'>('all')

// 筛选标签
const filterTabs = computed(() => [
  {
    key: 'all' as const,
    label: t('todoList.all'),
    count: currentList.value?.items.length || 0
  },
  {
    key: 'todo' as const,
    label: t('todoList.todo'),
    count: currentList.value?.items.filter(i => !i.completed).length || 0
  },
  {
    key: 'done' as const,
    label: t('todoList.done'),
    count: completedCount.value
  }
])

// 已完成数量
const completedCount = computed(() => {
  return currentList.value?.items.filter(i => i.completed).length || 0
})

// 过滤后的待办项
const filteredItems = computed(() => {
  if (!currentList.value) return []
  const items = currentList.value.items
  switch (currentFilter.value) {
    case 'todo':
      return items.filter(i => !i.completed)
    case 'done':
      return items.filter(i => i.completed)
    default:
      return items
  }
})

// 加载数据
function loadData() {
  const lists = storage.get<TodoList[]>(STORAGE_KEYS.TODO_LISTS, []) || []
  currentList.value = lists.find(l => l.id === listId.value) || null
}

// 保存数据
function saveData() {
  const lists = storage.get<TodoList[]>(STORAGE_KEYS.TODO_LISTS, []) || []
  const index = lists.findIndex(l => l.id === listId.value)
  if (index !== -1 && currentList.value) {
    lists[index] = currentList.value
    storage.set(STORAGE_KEYS.TODO_LISTS, lists)
  }
}

// 添加待办项
function addItem() {
  if (!newItemText.value.trim() || !currentList.value) return

  const newItem: TodoItem = {
    id: Date.now().toString(),
    text: newItemText.value.trim(),
    completed: false,
    createdAt: Date.now()
  }

  currentList.value.items.unshift(newItem)
  saveData()
  newItemText.value = ''
}

// 切换完成状态
function toggleItem(item: TodoItem) {
  item.completed = !item.completed
  saveData()
}

// 删除待办项
function showDeleteItem(item: TodoItem) {
  uni.showModal({
    title: t('common.deleteConfirm'),
    content: item.text,
    success: (res) => {
      if (res.confirm && currentList.value) {
        const index = currentList.value.items.findIndex(i => i.id === item.id)
        if (index !== -1) {
          currentList.value.items.splice(index, 1)
          saveData()
          uni.showToast({
            title: t('common.deleteSuccess'),
            icon: 'success'
          })
        }
      }
    }
  })
}

// 清除已完成
function clearCompleted() {
  uni.showModal({
    title: t('common.deleteConfirm'),
    content: t('todoList.clearCompletedConfirm'),
    success: (res) => {
      if (res.confirm && currentList.value) {
        currentList.value.items = currentList.value.items.filter(i => !i.completed)
        saveData()
        uni.showToast({
          title: t('common.deleteSuccess'),
          icon: 'success'
        })
      }
    }
  })
}

onLoad((options) => {
  if (options?.id) {
    listId.value = options.id
  }
})

onShow(() => {
  settingsStore.initTheme()
  loadData()
})
</script>

<style lang="scss">
@use '@/styles/variables.scss' as *;

.todo-detail-page {
  min-height: 100vh;
  background-color: var(--bg-page);
  padding-bottom: calc(env(safe-area-inset-bottom) + 180rpx);
}

// 筛选标签
.filter-tabs {
  display: flex;
  padding: 24rpx;
  gap: 16rpx;

  .tab-item {
    flex: 1;
    height: 72rpx;
    background-color: var(--bg-elevated);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: var(--text-secondary);
    transition: all 0.3s ease;

    &.active {
      background: $gradient-primary;
      color: #fff;

      .tab-count {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }

    .tab-count {
      min-width: 36rpx;
      height: 36rpx;
      padding: 0 10rpx;
    background: var(--bg-sunken);
      border-radius: 18rpx;
      font-size: 22rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 待办列表容器
.items-container {
  padding: 0 24rpx;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;

  .empty-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background-color: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;

    .icon-image {
      width: 60rpx;
      height: 60rpx;
      opacity: 0.6;
    }
  }

  .empty-title {
    font-size: 30rpx;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12rpx;
  }

  .empty-desc {
    font-size: 24rpx;
    color: var(--text-placeholder);
    text-align: center;
  }
}

// 待办项
.todo-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  background-color: var(--bg-elevated);
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;

  &.completed {
    opacity: 0.6;

    .item-text {
      text-decoration: line-through;
      color: var(--text-placeholder);
    }
  }

  .checkbox {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid var(--border-color);
    border-radius: 12rpx;
    margin-right: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;

    &.checked {
      background: $gradient-primary;
      border-color: transparent;

      .check-icon {
        color: #fff;
        font-size: 28rpx;
        font-weight: bold;
      }
    }
  }

  .item-text {
    flex: 1;
    font-size: 30rpx;
    color: var(--text-primary);
    line-height: 1.5;
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-page);
  padding: 24rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
  border-top: 1rpx solid var(--border-color);

  .input-wrapper {
    display: flex;
    gap: 16rpx;

    .item-input {
      flex: 1;
      height: 88rpx;
      background-color: var(--bg-elevated);
      border-radius: 16rpx;
      padding: 0 24rpx;
      font-size: 30rpx;
      color: var(--text-primary);
    }

    .add-item-btn {
      width: 88rpx;
      height: 88rpx;
      background: $gradient-primary;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .btn-icon {
        font-size: 48rpx;
        color: #fff;
        font-weight: 300;
      }
    }
  }

  .clear-btn {
    margin-top: 16rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-placeholder);
    font-size: 26rpx;
  }
}
</style>
