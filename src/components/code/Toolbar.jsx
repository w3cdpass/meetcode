export default function Toolbar({ editor }) {
  return (
    <div className="flex gap-2 p-2 bg-gray-50 border-b">
      <button
        className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
        onClick={() => editor.trigger("", "undo", null)}
      >
        Undo
      </button>
      <button
        className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
        onClick={() => editor.trigger("", "redo", null)}
      >
        Redo
      </button>
    </div>
  );
}