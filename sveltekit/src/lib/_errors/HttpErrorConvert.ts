import { error, type HttpError } from '@sveltejs/kit';
import { AppError, ErrorCategory } from './AppError';
import { DatabaseConnectionError } from './ExternalError';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { logger } from '$lib/index.server';

const ErrorCategoryToStatusCode = {
	[ErrorCategory.Not_Found]: 404,
	[ErrorCategory.Forbidden]: 403,
	[ErrorCategory.Invalid_Data]: 400,
	[ErrorCategory.Conflict]: 409,
	[ErrorCategory.External]: 503,
	[ErrorCategory.Unexpected]: 500
};

const calcStatusCode = (error: AppError) => ErrorCategoryToStatusCode[error.category] || 500;

export function AppErrorToHttpError(appError: AppError): HttpError {
	return error(calcStatusCode(appError), {
		name: appError.name,
		message: appError.message
	});
}

/**
 * HttpErrorConverter
 *  attaches itself to all services functions in order to create a wrapper around every function that will catch it's errors and
 *  transform them into SvelteKit errors. This way SvelteKit is able to build an appropriate response to clients.
 */
export function HttpErrorTransformerHook(target: any) {
	attachNested(target);

	const nestedProperties = Object.getOwnPropertyNames(target);
	nestedProperties.forEach((property) => {
		if (
			typeof target[property] === 'object' &&
			target[property] !== null &&
			property[0] !== '_'
		) {
			attachNested(target[property]);
		}
	});

	logger.setup("HttpErrorTransformer hooked to Services")

	function attachNested(target: any) {
		const originalMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(target));

		originalMethods
			.filter((name) => name !== 'constructor')
			.filter((name) => name[0] !== '_')
			.filter((name) => typeof target[name] === 'function')
			.forEach((functionName) => {
				const originalFunction = target[functionName];
				target[functionName] = async function (...args: any[]) {
					try {
						return await originalFunction.apply(this, args);
					} catch (e) {
						throw buildHttpError(e) satisfies HttpError;
					}
				};
			});
	}
};

function buildHttpError(e: any): HttpError {
	if (e instanceof AppError) {
		return AppErrorToHttpError(e);
	}

	logger.error(e);

	if (e instanceof PrismaClientInitializationError) {
		return AppErrorToHttpError(DatabaseConnectionError);
	} else {
		return error(500, {
			name: 'Unknown Error',
			message: e.message || 'There are no details about the error'
		});
	}
}
