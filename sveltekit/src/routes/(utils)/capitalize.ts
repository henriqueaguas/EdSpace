export const capitalizeWord = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export const capitalizeWords = (words: string[]) =>
  words.map((w) => capitalizeWord(w));
