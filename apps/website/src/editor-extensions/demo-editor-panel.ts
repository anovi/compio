import { EditorView, type Panel } from "@codemirror/view";
import '../styles/editor.css';

/**
 * Creates Codemirror's panel.
 */
export function createHelpPanel(view: EditorView, src: string): Panel {
    const dom = document.createElement('div');
    dom.classList.add('demo-editor-panel');

    const reset = document.createElement('button');
    reset.textContent = "Reset";
    reset.addEventListener('click', () => {
        view.dispatch({
            changes: { 
                from: 0, 
                to: view.state.doc.length, 
                insert: src
            }
        });
    })

    const copy = document.createElement('button');
    copy.textContent = "Copy";
    copy.addEventListener('click', copyEditorContent.bind(null, view));

    dom.appendChild(reset);
    dom.appendChild(copy);    
    
    return {
        top: true,
        dom,
        // mount: portaled ? () => portalContainer?.appendChild(panel.panel) : undefined,
        destroy: () => {
            dom.remove();
        },
    };
}

function copyEditorContent(view: EditorView) {
  // 1. Get the full string text from the editor state
  const textToCopy = view.state.doc.toString();

  // 2. Use the standard Clipboard API to write to the clipboard
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      console.log('Content successfully copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
}
