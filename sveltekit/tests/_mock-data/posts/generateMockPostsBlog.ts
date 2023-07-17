import { JSDOM } from 'jsdom';
import type { IntermediatePost } from './IntermediatePost';

const baseUrl = 'https://www.joelonsoftware.com/';

export async function generatePostsFromJoelBlog(): Promise<IntermediatePost[]> {
	const res = await fetch(baseUrl);
	const html = new JSDOM(await res.text()).window.document;

	const blogPosts = Array.from(html.querySelectorAll('.editor-recent-posts article'));

	return Promise.all(
		blogPosts.map(async (postHTML) => {
			const elem: HTMLLinkElement = postHTML.querySelector('h2.entry-title a')!;

			const title = elem.textContent!;
			const postLink = elem.href;
			const description = postHTML.querySelector('.entry-content p')?.textContent!;

			const content = await fetchPostContent(postLink);

			return { title, content, description } satisfies IntermediatePost;
		})
	) as Promise<IntermediatePost[]>;
}

async function fetchPostContent(postLink: string): Promise<string> {
	const res = await fetch(postLink);
	const html = new JSDOM(await res.text()).window.document;
	const content = html.querySelector('.entry-content')!.textContent!;
	return content;
}
