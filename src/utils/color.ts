export const getRandomHexColor = () => {
  const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}
