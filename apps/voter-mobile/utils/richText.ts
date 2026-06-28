/**
 * Utility: extract plain text from a Tiptap/ProseMirror JSON document.
 * The admin's rich text editor stores descriptions as:
 *   { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "..." }] }] }
 *
 * If the value is already a plain string it is returned as-is.
 */
export function extractPlainText(value?: string | null): string {
  if (!value) return '';

  // Try to parse as Tiptap JSON
  try {
    const parsed = JSON.parse(value);
    if (parsed?.type === 'doc' && Array.isArray(parsed.content)) {
      return parseTiptapNode(parsed).trim();
    }
  } catch {
    // Not JSON — already plain text
  }

  return value.trim();
}

function parseTiptapNode(node: any): string {
  if (!node) return '';

  // Leaf text node
  if (node.type === 'text') return node.text ?? '';

  // Nodes with children
  if (Array.isArray(node.content)) {
    const childText = node.content.map(parseTiptapNode).join('');
    // Add line break after block-level nodes
    const blockTypes = ['paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'listItem', 'codeBlock'];
    if (blockTypes.includes(node.type)) return childText + '\n';
    return childText;
  }

  return '';
}
