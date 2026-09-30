import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

function ToolbarButton({ onClick, active, disabled, children, title }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded border ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write content…",
  onRequestImage,
  minHeight = "160px",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "rich-text focus:outline-none px-3 py-2 min-h-[120px]",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className="border rounded-lg bg-white text-slate-400 px-3 py-2"
        style={{ minHeight }}
      >
        Loading editor…
      </div>
    );
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = async () => {
    if (onRequestImage) {
      const src = await onRequestImage();
      if (src) editor.chain().focus().setImage({ src }).run();
      return;
    }
    const src = window.prompt("Image URL (/uploads/... or /images/...)");
    if (src) editor.chain().focus().setImage({ src }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-slate-50">
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          title="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          Link
        </ToolbarButton>
        <ToolbarButton title="Image" onClick={insertImage}>
          Image
        </ToolbarButton>
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          Redo
        </ToolbarButton>
        <ToolbarButton
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          Clear
        </ToolbarButton>
      </div>
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.25rem;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
