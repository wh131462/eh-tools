<template>
  <view class="todo-list-page" :class="{ 'theme-dark': settingsStore.isDark }">
    <nav-bar :title="t('todoList.title')" />

    <!-- 清单列表 -->
    <view class="list-container">
      <!-- 空状态 -->
      <view v-if="todoLists.length === 0" class="empty-state">
        <view class="empty-icon">
          <image
            class="icon-image"
            src="/static/icons/todo-list.svg"
            mode="aspectFit"
          />
        </view>
        <text class="empty-title">{{ t('todoList.emptyList') }}</text>
        <text class="empty-desc">{{ t('todoList.emptyListDesc') }}</text>
      </view>

      <!-- 清单卡片 -->
      <view
        v-for="list in todoLists"
        :key="list.id"
        class="list-card"
        :style="{ background: list.bgColor }"
        @click="goToDetail(list.id)"
        @longpress="showDeleteConfirm(list)"
      >
        <view class="card-content">
          <text class="card-title">{{ list.name }}</text>
          <view class="card-stats">
            <text class="stats-text">
              {{ getCompletedCount(list) }}/{{ list.items.length }} {{ t('todoList.completed') }}
            </text>
          </view>
          <!-- 进度条 -->
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: getProgressPercent(list) + '%' }"
            />
          </view>
        </view>
        <view class="card-actions">
          <view class="action-btn edit-btn" @click.stop="editList(list)">
            <image
              class="action-icon"
              src="/static/icons/edit.svg"
              mode="aspectFit"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="showCreateModal = true">
      <text class="add-icon">+</text>
    </view>

    <!-- 创建/编辑弹窗 -->
    <view v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">
          {{ editingList ? t('todoList.editList') : t('todoList.createList') }}
        </text>

        <!-- 清单名称 -->
        <view class="form-item">
          <text class="form-label">{{ t('todoList.listName') }}</text>
          <input
            v-model="formData.name"
            class="form-input"
            :placeholder="t('todoList.listNamePlaceholder')"
          />
        </view>

        <!-- 背景色选择 -->
        <view class="form-item">
          <text class="form-label">{{ t('todoList.bgColor') }}</text>
          <view class="color-picker">
            <view
              v-for="color in presetColors"
              :key="color"
              class="color-option"
              :class="{ active: formData.bgColor === color }"
              :style="{ background: color }"
              @click="formData.bgColor = color"
            />
          </view>
        </view>

        <!-- 按钮 -->
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="closeModal">
            <text>{{ t('common.cancel') }}</text>
          </view>
          <view class="modal-btn confirm-btn" @click="saveList">
            <text>{{ t('common.confirm') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 工具分享图 Canvas -->
    <share-canvas
      canvas-id="todoListShareCanvas"
      :config="toolShareConfig"
      @generated="onToolShareGenerated"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store/modules/settings'
import { useShare } from '@/composables/useShare'
import { storage, STORAGE_KEYS } from '@/utils/storage'

const { t } = useI18n()
const settingsStore = useSettingsStore()

// 分享配置
useShare({
  title: t('todoList.title'),
  path: '/pages/life/todo-list/index'
})

// 工具分享图配置
const toolShareConfig = {
  toolName: t('todoList.title'),
  category: 'life' as const,
  subtitle: 'Todo List'
}

const toolShareImageUrl = ref('')

function onToolShareGenerated(url: string) {
  toolShareImageUrl.value = url
}

// 预设颜色
const presetColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
]

// 待办清单数据
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

const todoLists = ref<TodoList[]>([])
const showCreateModal = ref(false)
const editingList = ref<TodoList | null>(null)

const formData = reactive({
  name: '',
  bgColor: presetColors[0]
})

// 加载数据
function loadData() {
  const data = storage.get<TodoList[]>(STORAGE_KEYS.TODO_LISTS, [])
  todoLists.value = data || []
}

// 保存数据
function saveData() {
  storage.set(STORAGE_KEYS.TODO_LISTS, todoLists.value)
}

// 获取已完成数量
function getCompletedCount(list: TodoList): number {
  return list.items.filter(item => item.completed).length
}

// 获取进度百分比
function getProgressPercent(list: TodoList): number {
  if (list.items.length === 0) return 0
  return Math.round((getCompletedCount(list) / list.items.length) * 100)
}

// 跳转到详情页
function goToDetail(listId: string) {
  uni.navigateTo({
    url: `/pages/life/todo-list/detail/index?id=${listId}`
  })
}

// 编辑清单
function editList(list: TodoList) {
  editingList.value = list
  formData.name = list.name
  formData.bgColor = list.bgColor
  showCreateModal.value = true
}

// 关闭弹窗
function closeModal() {
  showCreateModal.value = false
  editingList.value = null
  formData.name = ''
  formData.bgColor = presetColors[0]
}

// 保存清单
function saveList() {
  if (!formData.name.trim()) {
    uni.showToast({
      title: t('todoList.nameRequired'),
      icon: 'none'
    })
    return
  }

  if (editingList.value) {
    // 编辑模式
    const index = todoLists.value.findIndex(l => l.id === editingList.value!.id)
    if (index !== -1) {
      todoLists.value[index].name = formData.name.trim()
      todoLists.value[index].bgColor = formData.bgColor
    }
  } else {
    // 创建模式
    const newList: TodoList = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      bgColor: formData.bgColor,
      items: [],
      createdAt: Date.now()
    }
    todoLists.value.unshift(newList)
  }

  saveData()
  closeModal()

  uni.showToast({
    title: t('common.saveSuccess'),
    icon: 'success'
  })
}

// 删除确认
function showDeleteConfirm(list: TodoList) {
  uni.showModal({
    title: t('common.deleteConfirm'),
    content: t('todoList.deleteListConfirm'),
    success: (res) => {
      if (res.confirm) {
        const index = todoLists.value.findIndex(l => l.id === list.id)
        if (index !== -1) {
          todoLists.value.splice(index, 1)
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

onShow(() => {
  settingsStore.initTheme()
  loadData()
})
</script>

<style lang="scss">
@use '@/styles/variables.scss' as *;

.todo-list-page {
  min-height: 100vh;
  background-color: var(--bg-page);
  padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx);
}

.list-container {
  padding: 24rpx;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;

  .empty-icon {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32rpx;

    .icon-image {
      width: 80rpx;
      height: 80rpx;
      opacity: 0.6;
    }
  }

  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16rpx;
  }

  .empty-desc {
    font-size: 26rpx;
    color: var(--text-placeholder);
    text-align: center;
  }
}

// 清单卡片
.list-card {
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: $shadow-lg;

  .card-content {
    flex: 1;
  }

  .card-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16rpx;
    display: block;
  }

  .card-stats {
    margin-bottom: 16rpx;

    .stats-text {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .progress-bar {
    height: 8rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4rpx;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: #fff;
      border-radius: 4rpx;
      transition: width 0.3s ease;
    }
  }

  .card-actions {
    margin-left: 24rpx;

    .action-btn {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;

      .action-icon {
        width: 32rpx;
        height: 32rpx;
      }
    }
  }
}

// 添加按钮
.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: calc(env(safe-area-inset-bottom) + 40rpx);
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.4);

  .add-icon {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
  }
}

// 弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 85%;
  max-width: 600rpx;
  background-color: var(--bg-page);
  border-radius: 24rpx;
  padding: 40rpx;

  .modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 40rpx;
    display: block;
  }
}

.form-item {
  margin-bottom: 32rpx;

  .form-label {
    font-size: 28rpx;
    color: var(--text-secondary);
    margin-bottom: 16rpx;
    display: block;
  }

  .form-input {
    width: 100%;
    height: 88rpx;
    background-color: var(--bg-elevated);
    border-radius: 16rpx;
    padding: 0 24rpx;
    font-size: 30rpx;
    color: var(--text-primary);
    box-sizing: border-box;
  }
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .color-option {
    width: 72rpx;
    height: 72rpx;
    border-radius: 16rpx;
    cursor: pointer;
    border: 4rpx solid transparent;
    box-sizing: border-box;

    &.active {
      border-color: var(--text-primary);
    }
  }
}

.modal-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 40rpx;

  .modal-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;

    &.cancel-btn {
      background-color: var(--bg-elevated);
      color: var(--text-secondary);
    }

    &.confirm-btn {
      background: $gradient-primary;
      color: #fff;
    }
  }
}
</style>
