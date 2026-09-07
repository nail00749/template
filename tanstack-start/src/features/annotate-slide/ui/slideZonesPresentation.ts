export const getSlideLabel = (slideNumber: number) => `Слайд ${slideNumber + 1}`

export const getChangesStatusLabel = (hasChanges: boolean) => {
  if (hasChanges) {
    return 'Есть несохраненные изменения'
  }
  return 'Нет изменений'
}
