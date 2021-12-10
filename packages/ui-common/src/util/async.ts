/**
 * Wait for `timeout` ms. Useful for mocking async actions in stories and showcasing loaders.
 *
 * This should **NEVER** be used in production code or tests! It creates flaky tests and
 * brittle components.
 *
 * @param timeout Number of ms to sleep for.
 * @returns Promise that resolves after `timeout` ms.
 */
export const sleep = (timeout: number): Promise<void> => new Promise(resolve => setTimeout(resolve, timeout))
