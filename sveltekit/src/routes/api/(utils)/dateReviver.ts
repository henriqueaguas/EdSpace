import { error, redirect } from "@sveltejs/kit";

/**
 * Extracts body from Fetch Response. It can parse properties of type Date
 * @returns null when body is empty
 */
export const ParseJSONResponse = async (
  res: Response,
): Promise<any> => {
  const bodyString = await res.text();

  if (bodyString.length === 0) {
    return null;
  }

  return JSON.parse(bodyString, dateReviver);
};

export function dateReviver(key: string, value: any): any {
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return new Date(value);
  }
  return value;
}
