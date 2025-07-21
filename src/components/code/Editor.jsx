import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

// === Memoized User Outside Component ===
const colors = [
  "rgba(255, 77, 79, 0.5)", // #ff4d4f
  "rgba(64, 169, 255, 0.5)", // #40a9ff
  "rgba(115, 209, 61, 0.5)", // #73d13d
  "rgba(255, 169, 64, 0.5)", // #ffa940
  "rgba(146, 84, 222, 0.5)", // #9254de
  "rgba(19, 194, 194, 0.5)", // #13c2c2
];
const user = {
  color: colors[Math.floor(Math.random() * colors.length)],
};

const roomname = `monaco-react-demo-${new Date().toLocaleDateString("en-CA")}`;
const languageCommentMap = {
  html: "<!-- You can write HTML here -->",
  css: "/* You can write CSS here */",
  javascript: "// You can write JavaScript here",
};

const App = () => {
  const ydoc = useRef(new Y.Doc()).current;
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const editorRef = useRef(null);
  const iframeRef = useRef(null);

  const [activeLanguage, setActiveLanguage] = useState("html");
  const [models, setModels] = useState({});
  const [me, setMe] = useState("");

  async function getMe() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_DEV_API}/chats`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      data.friends.map((item) => {
        setMe(item?.name);
      });

      // setMe(data?);
    } catch (error) {
      console.log("error" + error);
    }
  }
  useEffect(() => {
    const style = document.createElement("style");
    style.className = "y-remote-static-styles";
    style.innerHTML = `
    .yRemoteSelection {
      background-color: ${user.color};
    }
    .yRemoteSelectionHead {
      position: absolute;
      border-left: orange solid 2px;
      border-top: orange solid 2px;
      border-bottom: orange solid 2px;
      height: 100%;
      box-sizing: border-box;
    }
    .yRemoteSelectionHead::after {
      position: absolute;
      content: '${me}';
      border: 3px solid orange;
      border-radius: 4px;
      left: -4px;
      top: -30px;
      padding: 2px 6px;
      background: orange;
      color: white;
      font-size: 12px;
      font-family: sans-serif;
      white-space: nowrap;
    }
  `;
    document.head.appendChild(style);
    getMe();
    return () => {
      document.head.removeChild(style);
    };
  }, [me]);

  // === Setup Provider ===
  useEffect(() => {
    const provider = new WebsocketProvider(
      "wss://yjs-server-1.onrender.com",
      // "ws://yjs-server-1.onrender.com",
      roomname,
      ydoc
    );
    provider.awareness.setLocalStateField("user", user);
    providerRef.current = provider;

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [ydoc]);

  // === Awareness Cursor Decorations ===
  useEffect(() => {
    if (!editorRef.current || !providerRef.current) return;

    const editor = editorRef.current;
    const provider = providerRef.current;

    const decorations = new Map();

    const updateCursorDecorations = () => {
      const states = Array.from(provider.awareness.getStates().entries());

      decorations.forEach((oldDecs) => {
        editor.deltaDecorations(oldDecs, []);
      });
      decorations.clear();

      const newDecorations = [];

      for (const [clientId, state] of states) {
        if (clientId === provider.awareness.clientID) continue;

        // const cursor = state.cursor;
        // const selection = state.selection;
        const userData = state.user;
        if (!userData) continue;

        // const { name } = userData;

        //         const style = document.createElement("style");
        //         style.className = `user-name-style-${clientId}`;
        //         style.innerHTML = `
        //   .remote-selection-head-${clientId}::after {
        //     content: "${name.replace(/["\\]/g, "\\$&")} (#${clientId})";
        //   }
        // `;
        //         document.head.appendChild(style);

        // if (cursor) {
        //   newDecorations.push({
        //     range: new window.monaco.Range(
        //       cursor.line,
        //       cursor.column,
        //       cursor.line,
        //       cursor.column
        //     ),
        //     options: {
        //       className: `yRemoteSelectionHead remote-selection-head-${clientId}`,
        //       afterContentClassName: `yRemoteSelectionHead remote-selection-head-${clientId}`,
        //     },
        //   });
        // }

        // if (selection && selection.start && selection.end) {
        //   newDecorations.push({
        //     range: new window.monaco.Range(
        //       selection.start.line,
        //       selection.start.column,
        //       selection.end.line,
        //       selection.end.column
        //     ),
        //     options: {
        //       className: `remote-selection-${clientId}`,
        //       isWholeLine: false,
        //     },
        //   });
        // }
      }

      const newDecs = editor.deltaDecorations([], newDecorations);
      decorations.set(provider.awareness.clientID, newDecs);
    };

    provider.awareness.on("change", updateCursorDecorations);
    return () => {
      provider.awareness.off("change", updateCursorDecorations);
    };
  }, []);

  // === Broadcast Cursor Position ===
  useEffect(() => {
    if (!editorRef.current || !providerRef.current) return;

    const editor = editorRef.current;
    const provider = providerRef.current;

    const updateCursor = () => {
      const position = editor.getPosition();
      const selection = editor.getSelection();
      if (position && selection) {
        provider.awareness.setLocalStateField("cursor", {
          line: position.lineNumber,
          column: position.column,
        });
        provider.awareness.setLocalStateField("selection", {
          start: {
            line: selection.startLineNumber,
            column: selection.startColumn,
          },
          end: {
            line: selection.endLineNumber,
            column: selection.endColumn,
          },
        });
      }
    };

    const disposable = editor.onDidChangeCursorPosition(updateCursor);
    updateCursor();

    return () => disposable.dispose();
  }, []);

  // === Handle Tab Click ===
  const handleTabClick = (lang) => {
    if (!editorRef.current || activeLanguage === lang) return;

    const editor = editorRef.current;
    const provider = providerRef.current;

    if (bindingRef.current) {
      bindingRef.current.destroy();
    }

    const yText = ydoc.getText(lang);
    let model = models[lang];

    if (!model) {
      model = window.monaco.editor.createModel(languageCommentMap[lang], lang);
      setModels((prev) => ({ ...prev, [lang]: model }));
    }

    const newBinding = new MonacoBinding(
      yText,
      model,
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = newBinding;
    editor.setModel(model);
    setActiveLanguage(lang);
  };

  // === Live Preview with Throttling ===
  useEffect(() => {
    let last = { html: "", css: "", js: "" };

    const interval = setInterval(() => {
      const html = models.html?.getValue() || "";
      const css = models.css?.getValue() || "";
      const js = models.javascript?.getValue() || "";

      if (html === last.html && css === last.css && js === last.js) return;
      last = { html, css, js };

      const content = `
        <!DOCTYPE html>
        <html><head><style>${css}</style></head>
        <body>${html}<script type="module">${js}<\/script></body>
        </html>
      `;

      if (iframeRef.current) {
        iframeRef.current.srcdoc = content;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [models]);

  // === Editor Mount ===
  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    const lang = "html";
    const yText = ydoc.getText(lang);
    const model = window.monaco.editor.createModel(
      languageCommentMap[lang],
      lang
    );

    const binding = new MonacoBinding(
      yText,
      model,
      new Set([editor]),
      providerRef.current.awareness
    );
    bindingRef.current = binding;

    setModels({ [lang]: model });
    editor.setModel(model);
  };

  return (
    <div className="flex w-full h-screen bg-[#1e1e1e] text-white">
      <div className="w-14 bg-[#333] flex flex-col items-center py-4 gap-6 text-lg">
        <i className="fas fa-files"></i>
        <i className="fas fa-code-branch"></i>
        <i className="fas fa-play"></i>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center bg-[#252526] border-b border-[#333]">
          {["html", "css", "javascript"].map((lang) => (
            <span
              key={lang}
              onClick={() => handleTabClick(lang)}
              className={`flex gap-2 items-center text-xs p-2 cursor-pointer ${
                activeLanguage === lang ? "bg-gray-700" : "bg-gray-600"
              } text-gray-300`}
            >
              <i
                className={`text-xl ${
                  lang === "html"
                    ? "fa-brands fa-html5 text-[#e65100]"
                    : lang === "css"
                    ? "fa-brands fa-css3 text-[#2196f3]"
                    : "fa-brands fa-js text-[#ccb029]"
                }`}
              ></i>
              index.{lang}
            </span>
          ))}
        </div>

        <div className="flex flex-1">
          <Editor
            theme="vs-dark"
            defaultLanguage="html"
            defaultValue={languageCommentMap["html"]}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              fontFamily: "Fira Code, monospace",
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
          <div className="w-1/2 bg-white h-full">
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Live Preview"
            />
          </div>
        </div>
        <div className="h-6 px-4 bg-[#007acc] text-xs flex items-center justify-between">
          <span>Live Share Enabled</span>
          <span>Collaborator:{me}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
