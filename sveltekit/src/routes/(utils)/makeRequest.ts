import { notify } from './notify';
import type { HttpResponseHeaders } from '../api/(utils)/HttpHeaders';
import { ParseJSONResponse } from '../api/(utils)/dateReviver';
import { goto } from '$app/navigation';
import { callbackToHere } from './callbackToHere';
import type { HttpError } from '@sveltejs/kit';

export async function makeRequest<TResponseBody = any>(
	url: RequestInfo | URL,
	init?: (SafeOmit<RequestInit, 'body'> & { body?: any }) | undefined,
	handlers?: {
		onSuccess?: (res: TResponseBody, statusCode: number, headers: HttpResponseHeaders) => void;
		onError?: (err: App.Error, statusCode: number, headers: HttpResponseHeaders) => void;
		onCompleted?: () => void;
		uncaughtErrorStrategy?: 'notify' | 'throw' | 'ignore';
	}
): Promise<void> {
	console.log(':::: Making request Start ', url, init);
	const start = performance.now();

	try {
		let body: FormData | string | undefined = undefined;
		if (init && init.body) {
			if (init.body instanceof FormData) {
				body = init.body;
			} else {
				body = JSON.stringify(init.body);
			}
		}

		const res = await fetch(url, {
			...init,
			body: body
		});
		const resBody = await ParseJSONResponse(res);

		if (res.status === 401) {
			goto(`/auth?csrf=true`, {
				state: { callback: callbackToHere(), requiresAuthn: true }
			});
			return;
		}

		if (res.status >= 400) {
			const errorBody = resBody as HttpError['body'];

			if (handlers?.onError) {
				handlers.onError(errorBody, res.status, Object.fromEntries(res.headers.entries()));
			} else {
				if (handlers?.uncaughtErrorStrategy === 'throw') {
					throw errorBody;
				} else {
					notify.error(errorBody.message);
				}
			}
		} else {
			if (handlers?.onSuccess) {
				handlers.onSuccess(
					resBody as TResponseBody,
					res.status,
					Object.fromEntries(res.headers.entries())
				);
			}
		}
	} finally {
		handlers?.onCompleted?.();

		console.log(
			':: Making request End ',
			url,
			init,
			(performance.now() - start).toFixed(2),
			'ms'
		);
	}
}
