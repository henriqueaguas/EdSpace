import { writable } from "svelte/store";

export const newBlankPage = () => ({ type: null, content: undefined, localUrl: undefined })

export type PostPageContent =
  | {
    type: "Image" | "PDF";
    content: File;
    localUrl: string;
  }
  | { type: "Markdown"; content: string | File; localUrl?: string }
  | { type: "Quiz"; content: tquiz.Quiz; localUrl?: never }
  | ReturnType<typeof newBlankPage>

export const pages = writable<Array<PostPageContent>>([newBlankPage()]);

export function clearPagesStore() {
  pages.set([newBlankPage()]);
}
