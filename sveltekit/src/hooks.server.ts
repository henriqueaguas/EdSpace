// https://authjs.dev/reference/sveltekit

import Google from '@auth/core/providers/google';

import { SvelteKitAuth } from '@auth/sveltekit';

import type { Profile } from '@auth/core/types';
import type { Provider } from '@auth/core/providers';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { Adapter } from '@auth/core/adapters';
import {
	AUTHJS_SECRET,
	OAUTH_GOOGLE_ID,
	OAUTH_GOOGLE_SECRET,
	SENDGRID_API
} from '$lib/envProvider';
import { prismaClient } from '$lib/index.server';

export const handle = SvelteKitAuth({
	adapter: PrismaAdapter(prismaClient) as Adapter,
	secret: AUTHJS_SECRET,
	trustHost: true,
	providers: [
		Google({
			clientId: OAUTH_GOOGLE_ID,
			clientSecret: OAUTH_GOOGLE_SECRET,
			authorization: {
				params: {
					prompt: 'consent'
				}
			}
		}) as Provider<Profile>,
		{
			id: 'email',
			type: 'email',
			async sendVerificationRequest({
				identifier: email,
				url
			}: {
				identifier: string;
				url: string;
			}) {
				// Call the cloud Email provider API for sending emails
				// See https://docs.sendgrid.com/api-reference/mail-send/mail-send
				const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
					// The body format will vary depending on provider, please see their documentation
					// for further details.
					body: JSON.stringify({
						personalizations: [{ to: [{ email }] }],
						from: { email: 'a48302@alunos.isel.pt' },
						subject: 'EdSpace Authentication',
						content: [
							{
								type: 'text/html',
								value: `<html><body style="padding:20px;text-align:center;color:#0D1117"><h1 style="margin-bottom:25px">EdSpace - Authentication</h1><a href='${url}' style="font-weight:bold;padding:10px 30px;background-color:orange;border-radius:12px;color:black">Complete Authentication</a></body></html>`
							}
						]
					}),
					headers: {
						// Authentication will also vary from provider to provider, please see their docs.
						Authorization: `Bearer ${SENDGRID_API}`,
						'Content-Type': 'application/json'
					},
					method: 'POST'
				});

				if (!response.ok) {
					const { errors } = await response.json();
					throw new Error(JSON.stringify(errors));
				}
			}
		} as any
	],
	callbacks: {
		session: ({ user, session }) => {
			// Appends the complete/private user information to the session
			return {
				expires: session.expires,
				user: user
			};
		}
	},
	pages: {
		signIn: '/auth'
	}
});