export const items = Array.from({ length: 1000000 }, (_, i) => ({
  id: i + 1,
  name: `Элемент ${i + 1}`,
  isSelected: false,
  order: i 
}))