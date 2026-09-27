import { IterMode, Tree } from "@lezer/common";

const TREE_RULER = '-'.repeat(30);

export function formatTreeBody(tree: Tree, from?: number, to?: number): string {
	const lines: string[] = [];
	let level = 0;
	tree.iterate({
		from,
		to,
		mode: IterMode.IncludeAnonymous,
		enter: (node) => {
			lines.push(' '.repeat(level * 2) + node.name);
			level++;
		},
		leave: () => {
			level--;
		},
	});
	return lines.join('\n');
}

function formatTree(tree: Tree, from?: number, to?: number): string {
	return [TREE_RULER, formatTreeBody(tree, from, to), TREE_RULER].join('\n');
}

/** Logs tree with dashed rules; node lines match what `assertMatchTree` compares. */
export function printTree(tree: Tree, from?: number, to?: number) {
	console.log(formatTree(tree, from, to));
}