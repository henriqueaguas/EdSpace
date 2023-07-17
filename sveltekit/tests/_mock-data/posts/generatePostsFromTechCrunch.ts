import type { IntermediatePost } from "./IntermediatePost";
import { JSDOM } from "jsdom";

const url = (pageNr: number) =>
  `https://techcrunch.com/wp-json/tc/v1/magazine?page=${pageNr}&_embed=true&_envelope=true&categories=21587494&cachePrevention=0`;

function removeHtmlTags(str: string) {
  const dom = new JSDOM(`<!DOCTYPE html><div>${str}</div>`);
  const div = dom.window.document.querySelector("div");
  return div!.textContent || div!.innerText || "";
}
/*
({
    ...u,
    id: generateUUID(),
    emailVerified: dateStringToDate(u.emailVerified),
    created_at: dateStringToDate(u.created_at),
    name_updated_at: dateStringToDate(u.name_updated_at),
    image_updated_at: dateStringToDate(u.image_updated_at),
  })) satisfies tuser.User[]
*/
export async function generatePostsFromTechCrunch(): Promise<
  IntermediatePost[]
> {
  const pages = await Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((pageNr) =>
      fetch(url(pageNr))
        .then((res) => res.json())
        .then((res) => res.body)
        .then((res) =>
          res.map((r: any) => ({
            title: removeHtmlTags(r.title.rendered),
            description: removeHtmlTags(r.excerpt.rendered),
            content: removeHtmlTags(r.content.rendered),
          } satisfies IntermediatePost))
        )
    ),
  );

  return pages.flat();
}
