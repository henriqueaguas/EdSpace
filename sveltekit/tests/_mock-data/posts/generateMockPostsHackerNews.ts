import { JSDOM } from 'jsdom';
import type { IntermediatePost } from './IntermediatePost';

const baseUrl = 'https://thehackernews.com';

export async function generatePostsFromHackerNews(): Promise<IntermediatePost[]> {
	const res = await fetch(baseUrl);
	const html = new JSDOM(await res.text()).window.document;

	const blogPosts = Array.from(html.querySelectorAll('.blog-posts .body-post'));

	return Promise.all(
		blogPosts.map(async (postHTML) => {
			const title: string = postHTML.querySelector('h2.home-title')?.textContent!;
			const postLink: string = (postHTML.querySelector('.story-link') as HTMLLinkElement)?.href;
			const description = postHTML.querySelector('.home-desc')?.textContent!;

			if (!postLink.includes(baseUrl)) {
				return null;
			}

			const content = await fetchPostContent(postLink);

			return { title, content, description } satisfies IntermediatePost;
		})
	).then((res) => res.filter((it) => it !== null)) as Promise<IntermediatePost[]>;
}

async function fetchPostContent(postLink: string): Promise<string> {
	const res = await fetch(postLink);
	const html = new JSDOM(await res.text()).window.document;
	const content = html
		.querySelector('.articlebody')!
		.textContent!.replace('(adsbygoogle = window.adsbygoogle || []).push({});', '');
	return content;
}
