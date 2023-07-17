export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatNumber(num: number) {
  if (num >= 1000000000) {
    const formattedNum = (num / 1000000000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formattedNum.replace(/\.00$/, "") + "B";
  } else if (num >= 1000000) {
    const formattedNum = (num / 1000000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formattedNum.replace(/\.00$/, "") + "M";
  } else if (num >= 1000) {
    const formattedNum = (num / 1000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    return formattedNum.replace(/\.0$/, "") + "K";
  } else {
    return num.toString();
  }
}
