/**
 * 格式化日期
 * @param timestamp 时间戳
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (timestamp: number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const date = new Date(Number(timestamp));

  const formatMap: { [key: string]: number | string } = {
    'yyyy': date.getFullYear(),
    'YYYY': date.getFullYear(),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'dd': String(date.getDate()).padStart(2, '0'),
    'HH': String(date.getHours()).padStart(2, '0'),
    'hh': String(date.getHours() > 12 ? (date.getHours() % 12).toString().padStart(2, '0') : date.getHours().toString().padStart(2, '0')),
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'ss': String(date.getSeconds()).padStart(2, '0')
  };

  return format.replace(/(yyyy|YYYY|MM|dd|HH|hh|mm|ss)/g, match => String(formatMap[match]));
};
