# 工具注册参考

## 目录

1. [Tool 接口定义](#tool-接口定义)
2. [注册步骤](#注册步骤)
3. [分类与渐变色](#分类与渐变色)
4. [图标映射表](#图标映射表)

## Tool 接口定义

```typescript
// src/types/tool.ts
interface Tool {
  id: string          // 工具ID，kebab-case，全局唯一 (如: 'unit-converter')
  name: string        // 中文显示名称
  nameKey: string     // i18n 翻译键 (如: 'tool.unitConverter')
  icon: string        // SVG 图标名称 (对应 src/static/icons/ 下文件名，不含 .svg)
  path: string        // 路由路径 (如: '/pages/calc/unit-converter/index')
  category: ToolCategory  // 分类: 'time' | 'calc' | 'text' | 'image' | 'life'
}
```

## 注册步骤

### 1. src/types/tool.ts — 添加工具条目

在 `TOOLS` 数组对应分类注释下添加:

```typescript
{ id: '{tool-id}', name: '{中文名}', nameKey: 'tool.{camelCaseId}', icon: '{icon-name}', path: '/pages/{category}/{tool-id}/index', category: '{category}' }
```

### 2. src/pages.json — 注册路由

在 `pages` 数组末尾添加:

```json
{
  "path": "pages/{category}/{tool-id}/index",
  "style": {
    "navigationBarTitleText": "{中文名}"
  }
}
```

如果工具有子页面 (如配置页、历史页)，为每个子页面添加独立路由。

### 3. src/i18n/zh.ts — 中文翻译

添加两处:

```typescript
// 1. tool 对象中添加工具名称
tool: {
  {camelCaseId}: '{中文名}',
}

// 2. 顶层添加工具专属翻译对象
{camelCaseId}: {
  title: '{中文名}',
  // ... 工具特有的翻译项
}
```

### 4. src/i18n/en.ts — 英文翻译

同上结构，使用英文值。

### 5. src/styles/variables.scss — 工具卡片渐变色

在对应分类注释下添加:

```scss
$gradient-{icon-name}: linear-gradient(135deg, #{起始色} 0%, #{结束色} 100%);
```

渐变色选择原则:
- 135deg 对角线方向
- 同分类工具色调相近但有区分
- 避免与已有工具渐变重复

### 6. src/components/common/ToolCard.vue — 图标与渐变映射

在 `TOOL_ICONS` 中添加:

```typescript
'{tool-id}': '/static/icons/{icon-name}.svg',
```

在 `TOOL_GRADIENTS` 中添加:

```typescript
'{tool-id}': 'var(--gradient-{icon-name})',
```

### 7. src/pages/index/index.vue — 首页图标映射

在 `TOOL_ICONS` 中添加同样的映射条目。

## 分类与渐变色

| 分类 | id | 渐变色 | 色调 |
|------|------|--------|------|
| 时间工具 | time | #fa709a → #fee140 | 粉-黄 |
| 计算工具 | calc | #a18cd1 → #fbc2eb | 紫-粉 |
| 文本工具 | text | #667eea → #764ba2 | 紫蓝 |
| 图片工具 | image | #f093fb → #f5576c | 粉-红 |
| 生活工具 | life | #4facfe → #00f2fe | 蓝-青 |

## 图标映射表 (现有)

| tool-id | icon 字段 | SVG 文件名 |
|---------|-----------|------------|
| calendar | calendar | calendar.svg |
| countdown | timer | timer.svg |
| time-diff | hourglass | hourglass.svg |
| world-clock | globe | globe.svg |
| calculator | calculator | calculator.svg |
| salary | money | money.svg |
| bmi | scale | scale.svg |
| mortgage | building | building.svg |
| unit-converter | ruler | ruler.svg |
| encrypt | lock | lock.svg |
| qrcode | qrcode | qrcode.svg |
| compress | compress | compress.svg |
| filter | palette | palette.svg |
| color-card | colorCard | color-card.svg |
| color-converter | colorSwap | color-swap.svg |
| lucky-wheel | wheel | wheel.svg |
