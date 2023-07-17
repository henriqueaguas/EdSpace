type ValidHttpResponseHeader =
	| 'Access-Control-Allow-Origin'
	| 'Cache-Control'
	| 'Content-Location'
	| 'Content-Type'
	| 'ETag'
	| 'Expires'
	| 'Location'
	| 'WWW-Authenticate';

export type HttpResponseHeaders = {
	[key in ValidHttpResponseHeader]?: string | string[];
};
