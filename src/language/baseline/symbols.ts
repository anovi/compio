export const
SPACE = 32,
ZERO = 48,
NINE = 57,
COLON = 58,
EQUALS = 61,
UNDERSCORE = 95,
A = 65,
Z = 90,
a = 97,
z = 122

export function isDigit(code: number) {
    return code >= 48 && code <= 57;
}

export function isEqualsSymbol(code: number) {
    return code === EQUALS || code === COLON;
}

/** Matches Lezer `@whitespace` / grammar `space { @whitespace+ }`. */
export function isSkippedWhitespace(code: number) {
    return code === 9 || code === 10 || code === 11 || code === 12 || code === 13 || code === 32;
}