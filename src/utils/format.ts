/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date, format = 'yyyy-MM-dd HH:mm:ss'): string {
  const pad = (n: number) => n.toString().padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return format
    .replace('yyyy', year.toString())
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化时间显示 (HH:MM:SS)
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map(n => n.toString().padStart(2, '0'))
    .join(':')
}

/**
 * 格式化数字，保留指定小数位并去除末尾零
 */
export function formatNumber(num: number, decimals = 2): string {
  return parseFloat(num.toFixed(decimals)).toString()
}

/**
 * 格式化金额
 */
export function formatMoney(amount: number): string {
  return amount.toFixed(2)
}

/**
 * 获取版权年份范围
 */
export function getCopyrightYears(): string {
  const startYear = 2025
  const currentYear = new Date().getFullYear()
  if (currentYear === startYear) {
    return startYear.toString()
  }
  return `${startYear}-${currentYear}`
}
