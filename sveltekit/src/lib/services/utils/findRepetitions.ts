export const hasRepetitions = (arr: string[]) =>
	arr.filter((element, index) => arr.indexOf(element, index + 1) > -1).length > 0;
