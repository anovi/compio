// Initially taken from library: https://github.com/metarhia/metautil/blob/master/lib/trie.js
'use strict';

const VALUE = Symbol('value');

export class Trie {
  #root = Object.create(null);
  #size = 0;
  #nodeCount = 1;

  static empty() {
    return new this();
  }

  static fromWords(words) {
    const trie = this.empty();
    for (const word of words) trie.addWord(word);
    return trie;
  }

  get size() {
    return this.#size;
  }

  get nodeCount() {
    return this.#nodeCount;
  }

  insert(word, ...args) {
    if (typeof word !== 'string') {
      throw new TypeError('Word must be a string');
    }
    word = word.toLowerCase();
    const value = args.length === 0 ? true : args[0];
    this.#insert(word, value);
    return this;
  }

  addWord(word, ...args) {
    if (typeof word !== 'string') {
      throw new TypeError('Word must be a string');
    }
    this.#insert(word.toLowerCase(), args[0]);
  }

  #insert(word, value) {
    let node = this.#root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      let child = node[char];
      if (!child) {
        child = Object.create(null);
        node[char] = child;
        this.#nodeCount++;
      }
      node = child;
    }
    if (!Object.hasOwn(node, VALUE)) this.#size++;
    node[VALUE] = value;
  }

  delete(word) {
    if (typeof word !== 'string') return false;
    word = word.toLowerCase();
    const path = [];
    let node = this.#root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const child = node[char];
      if (!child) return false;
      path.push(node, char);
      node = child;
    }
    if (!Object.hasOwn(node, VALUE)) return false;
    Reflect.deleteProperty(node, VALUE);
    this.#size--;
    for (let i = path.length - 2; i >= 0; i -= 2) {
      const parent = path[i];
      const char = path[i + 1];
      const child = parent[char];
      if (Object.hasOwn(child, VALUE)) break;
      if (Object.keys(child).length > 0) break;
      Reflect.deleteProperty(parent, char);
      this.#nodeCount--;
    }
    return true;
  }

  clear() {
    this.#root = Object.create(null);
    this.#size = 0;
    this.#nodeCount = 1;
  }

  isEmpty() {
    return this.#size === 0;
  }

  has(word) {
    const node = this.#find(word);
    return node !== null && Object.hasOwn(node, VALUE);
  }

  hasWord(word) {
    return this.has(word);
  }

  get(word) {
    const node = this.#find(word);
    let value;
    if (node !== null && Object.hasOwn(node, VALUE)) value = node[VALUE];
    return value;
  }

  getWordValue(word) {
    return this.get(word);
  }

  hasPrefix(prefix) {
    return this.#findPrefix(prefix) !== null;
  }

  complete(prefix) {
    if (typeof prefix !== 'string') return [];
    prefix = prefix.toLowerCase();
    const node = this.#findPrefix(prefix);
    if (!node) return [];
    return this.#collect(node, prefix);
  }

  searchByPrefix(prefix) {
    if (typeof prefix !== 'string') return [];
    prefix = prefix.toLowerCase();
    const node = this.#findPrefix(prefix);
    if (!node) return [];
    return this.#collectEntries(node, prefix);
  }

  longestMatchUtf16(peek) {
    let node = this.#root;
    let best = 0;
    let depth = 0;
    for (;;) {
      const unit = peek(depth);
      if (unit < 0) break;
      const char = String.fromCharCode(unit).toLowerCase()[0];
      node = node[char];
      if (!node) break;
      depth++;
      if (Object.hasOwn(node, VALUE)) best = depth;
    }
    return best;
  }

  #find(word) {
    if (typeof word !== 'string') return null;
    return this.#findPrefix(word);
  }

  #findPrefix(word) {
    if (typeof word !== 'string') return null;
    word = word.toLowerCase();
    let node = this.#root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      node = node[char];
      if (!node) return null;
    }
    return node;
  }

  #collect(node, path, words = []) {
    if (Object.hasOwn(node, VALUE)) words.push(path);
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const char = keys[i];
      this.#collect(node[char], path + char, words);
    }
    return words;
  }

  #collectEntries(node, path, entries = []) {
    if (Object.hasOwn(node, VALUE)) {
      entries.push({ word: path, value: node[VALUE] });
    }
    const keys = Object.keys(node);
    for (let i = keys.length - 1; i >= 0; i--) {
      const char = keys[i];
      this.#collectEntries(node[char], path + char, entries);
    }
    return entries;
  }
}

export { Trie as PrefixTree };
