export class Trie<T = boolean> {
	readonly size: number;
	readonly nodeCount: number;

	constructor();

	static empty<T = void>(): Trie<T>;
	static fromWords(words: readonly string[]): Trie<void>;

	insert(word: string, value?: T): this;
	addWord(word: string, ...args: T extends void ? [] : [value: T]): void;
	delete(word: string): boolean;
	clear(): void;
	isEmpty(): boolean;
	has(word: string): boolean;
	hasWord(word: string): boolean;
	get(word: string): T | undefined;
	getWordValue(word: string): T | undefined;
	hasPrefix(prefix: string): boolean;
	complete(prefix: string): string[];
	searchByPrefix(prefix: string): Array<{
		word: string;
		value: T | undefined;
	}>;
	longestMatchUtf16(peek: (offset: number) => number): number;
}

export { Trie as PrefixTree };
