interface TextCutOptions {
  text: string
  maxSymbolsCount: number
}

export const textCut = ({ text, maxSymbolsCount }: TextCutOptions) => {
  if (text?.length > maxSymbolsCount)
    return `${text.slice(0, maxSymbolsCount - 3)}...${text.slice(-3)}`
  else return text
}

export type TTitles = [string, string, string]

export const pluralize = (count: number, titles: TTitles, inclusive = false) => {
  let result = ''

  if (count % 10 === 1 && count % 100 !== 11) {
    result = titles[0]
  } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
    result = titles[1]
  } else {
    result = titles[2]
  }

  return inclusive ? `${count} ${result}` : result
}
