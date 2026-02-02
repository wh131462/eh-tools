---
name: create-tool
description: 为 EH-Tools 项目创建新工具的完整流程规范。当用户要求添加新工具、新功能页面、或提到"创建工具"、"添加工具"、"新建工具"时触发。涵盖工具注册、SVG 图标创建、页面组件编写、i18n 国际化、暗黑模式适配、首页展示配置等全部步骤。
---

# 创建工具流程

## 前置信息收集

创建工具前，确认以下信息:

1. **工具名称** — 中文名 + 英文名
2. **工具分类** — `time` | `calc` | `text` | `image` | `life`
3. **工具 ID** — kebab-case，如 `unit-converter`
4. **核心功能** — 工具要实现什么

## 创建步骤 (严格按顺序执行)

### Step 1: 创建 SVG 图标

在 `src/static/icons/{icon-name}.svg` 创建图标。

规范详见 [svg-icon-guide.md](references/svg-icon-guide.md)。核心要求:
- viewBox `0 0 24 24`，fill `none`
- 所有颜色统一 `#667eea`
- stroke-width 主体 `2`，细节 `1.5`
- 图标内容需要语义化表达工具功能

参考模板: [icon-template.svg](assets/icon-template.svg)

### Step 2: 注册工具配置

详见 [tool-registry.md](references/tool-registry.md)。按以下文件顺序修改:

**2.1** `src/types/tool.ts` — 在 `TOOLS` 数组对应分类下添加:

```typescript
{ id: '{tool-id}', name: '{中文名}', nameKey: 'tool.{camelCaseId}', icon: '{icon-name}', path: '/pages/{category}/{tool-id}/index', category: '{category}' }
```

**2.2** `src/pages.json` — 在 `pages` 数组末尾添加路由

**2.3** `src/styles/variables.scss` — 在对应分类的工具卡片渐变注释下添加:

```scss
$gradient-{icon-name}: linear-gradient(135deg, #色1 0%, #色2 100%);
```

**2.4** `src/components/common/ToolCard.vue` — 在 `TOOL_ICONS` 和 `TOOL_GRADIENTS` 中添加映射

**2.5** `src/pages/index/index.vue` — 在 `TOOL_ICONS` 中添加映射

### Step 3: 添加 i18n 翻译

**3.1** `src/i18n/zh.ts`:
- `tool` 对象中添加: `{camelCaseId}: '{中文名}'`
- 顶层添加工具翻译对象，至少包含 `title` 字段

**3.2** `src/i18n/en.ts`:
- 同上结构，使用英文值
- 翻译要求简洁，ToolCard 上名称不超过 5 个英文字符最佳

### Step 4: 创建页面组件

在 `src/pages/{category}/{tool-id}/index.vue` 创建页面。

参考模板: [page-template.vue](assets/page-template.vue)，将 `__TOOL_ID__` 替换为实际 tool-id，`__CAMEL_ID__` 替换为 camelCase id。

样式规范详见 [style-guide.md](references/style-guide.md)。核心要求:

- 根元素绑定 `:class="{ 'theme-dark': settingsStore.isDark }"`
- **必须使用自定义 NavBar 组件**: `<nav-bar :title="t('{camelCaseId}.title')" />`
  - TabBar 页面需设置 `:show-back="false"`
  - 需要控制显隐时使用 `:visible="条件"`
- 所有颜色使用 CSS 变量 (`var(--xxx)`)，不硬编码
- `onShow` 中调用 `settingsStore.initTheme()`（不需要手动设置导航栏标题，NavBar 组件会处理）
- 所有用户可见文本使用 `t()` 翻译函数
- 样式引入: `@use '@/styles/variables.scss' as *`

**⚠️ i18n 数组类型数据禁止使用 `t()` 获取**

vue-i18n 的 `t()` 函数只能返回字符串，**不能**用于获取数组类型的翻译值（如星期名、星座名、生肖名等）。使用 `t('key')` 获取数组会导致运行时报错 `Not found 'xxx' key in locale messages`。

**错误写法:**
```typescript
// ❌ 不要这样做 — t() 无法返回数组
const weekdays = t('ageCalculator.weekdays') as unknown as string[]
const zodiacNames = t('ageCalculator.zodiacNames') as unknown as string[]
```

**正确写法:** 将数组数据直接定义在组件中，不通过 i18n 获取:
```typescript
// ✅ 直接在组件中定义数组常量
const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const zodiacNames = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
```

适用场景: 星期名、月份名、星座名、生肖名、枚举选项列表等所有数组类型的本地化数据。i18n 翻译文件中可以保留这些数组定义作为参考，但页面组件中必须直接定义使用。

**NavBar 组件说明** (位于 `src/components/common/NavBar.vue`):
```vue
<nav-bar
  :title="t('toolName.title')"  <!-- 标题，使用 i18n -->
  :show-back="true"              <!-- 是否显示返回按钮，默认 true -->
  :visible="true"                <!-- 是否显示导航栏，默认 true -->
  :placeholder="true"            <!-- 是否显示占位，默认 true -->
/>
```

### Step 5: 验证清单

创建完成后逐项检查:

- [ ] SVG 图标存在于 `src/static/icons/`，颜色为 `#667eea`
- [ ] `src/types/tool.ts` 中 TOOLS 数组已添加条目
- [ ] `src/pages.json` 中已注册路由
- [ ] `src/styles/variables.scss` 中已添加渐变色变量
- [ ] `src/components/common/ToolCard.vue` 中 TOOL_ICONS 和 TOOL_GRADIENTS 已添加
- [ ] `src/pages/index/index.vue` 中 TOOL_ICONS 已添加
- [ ] `src/i18n/zh.ts` 已添加工具名称和工具翻译对象
- [ ] `src/i18n/en.ts` 已添加对应英文翻译
- [ ] 页面组件已创建，包含暗黑模式适配
- [ ] 页面使用 `<nav-bar>` 自定义导航栏组件
- [ ] 页面所有文本使用 i18n `t()` 函数
