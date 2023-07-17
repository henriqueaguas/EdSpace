import { ParseObjectError } from '$lib/_errors/ParseObjectError';
import { AppError } from '../src/lib/_errors/AppError';

export async function assertThrows(
	p: Promise<any>,
	expectedError?: AppError,
	expectingTypeError?: boolean
) {
	try {
		await p;
	} catch (err) {
		const error: any | AppError = err;

		// Checking if it's HttpError, sveltekit error format
		if (!(error instanceof AppError)) {
			throw new Error('AssertThrows: Error is not an expected App Error: ' + error);
		}
		const knownError: AppError = error;

		if (expectingTypeError) {
			if (!(knownError instanceof ParseObjectError)) {
				throw new Error('AssertThrows: Expected a type validation error but got: ' + err);
			}
			// it was a type error
			return;
		}

		if (!expectedError) {
			throw new Error(
				'AssertThrows: You need to pass either expectedError or expectingTypeError'
			);
		}

		if (expectedError.equals(error)) {
			return;
		}

		console.error('AssertThrows: EXPECTED =>', expectedError, ' | GOT => ', knownError);

		throw new Error('AssertThrows: EXPECTED =>' + expectedError + ' | GOT => ' + knownError);
	}
	throw new Error('AssertThrows: Did not throw!');
}

export async function assertDoesNotThrow<R>(p: Promise<any>): Promise<R> {
	return p;
}
