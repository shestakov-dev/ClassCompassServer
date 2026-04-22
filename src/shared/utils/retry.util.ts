import { AxiosError } from "axios";
import pRetry, { Options } from "p-retry";

const DEFAULT_RETRY_OPTIONS: Options = {
	retries: 2,
	minTimeout: 500,
	maxTimeout: 5_000,
	factor: 2,
	randomize: true,
	shouldRetry: ({ error }) => {
		return isRetryableError(error);
	},
};
const RETRYABLE_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

const RETRYABLE_ERROR_CODES = new Set([
	"ECONNABORTED",
	"ECONNRESET",
	"ETIMEDOUT",
	"EAI_AGAIN",
	"ENETUNREACH",
	"EPIPE",
]);

export async function retry<T>(
	operation: () => Promise<T>,
	options: Options = {}
): Promise<T> {
	const effectiveOptions: Options = {
		...DEFAULT_RETRY_OPTIONS,
		...options,
	};

	return pRetry(() => operation(), effectiveOptions);
}

function isRetryableError(error: unknown): boolean {
	if (error instanceof AxiosError) {
		// No response usually means transport-level failure.
		if (!error.response) {
			return true;
		}

		return RETRYABLE_HTTP_STATUSES.has(error.response.status);
	}

	const errorCode = getErrorCode(error);

	if (errorCode && RETRYABLE_ERROR_CODES.has(errorCode)) {
		return true;
	}

	if (error instanceof Error && RETRYABLE_ERROR_CODES.has(error.message)) {
		return true;
	}

	return false;
}

function getErrorCode(error: unknown): string | undefined {
	if (!error || typeof error !== "object") {
		return undefined;
	}

	if (!("code" in error)) {
		return undefined;
	}

	const { code } = error;

	return typeof code === "string" ? code : undefined;
}
