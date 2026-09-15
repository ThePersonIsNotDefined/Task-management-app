import '@testing-library/jest-dom';

if (!globalThis.structuredClone) {
	globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
}