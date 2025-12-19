"use client";

import { useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (html: string) => void;
};

// Editor Rich Text liviano basado en contentEditable, suficiente para negritas,
// itálicas, listas y enlaces. El HTML se sanitiza en el backend antes de guardarse.

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  name,
  label,
  value,
  onChange,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const selectionRef = useRef<Range | null>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      // Solo actualizar si el contenido es diferente para evitar perder el cursor
      // Si el editor está vacío y value es "", no pasa nada.
      // Si el editor tiene texto y value cambia externamente, se actualiza.
      if (document.activeElement !== ref.current) {
         ref.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const handleInput = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  const exec = (command: string, value?: string) => {
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand(command, false, value);
    handleInput();
    // Asegurar que el foco vuelva al editor
    if (ref.current) {
       // ref.current.focus(); 
       // No forzamos foco aquí porque onMouseDown preventDefault ya ayuda, 
       // y a veces queremos mantener la selección tal cual.
    }
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      selectionRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && selectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(selectionRef.current);
    }
  };

  const openLinkInput = () => {
    saveSelection();
    setShowLinkInput(true);
    setLinkUrl("");
  };

  const applyLink = () => {
    restoreSelection();
    if (linkUrl) {
      exec("createLink", linkUrl);
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const cancelLink = () => {
    setShowLinkInput(false);
    setLinkUrl("");
    restoreSelection();
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          {label}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
        <button
          type="button"
          className="rounded px-2 py-1 hover:bg-slate-200 font-bold"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          title="Negrita"
        >
          B
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 hover:bg-slate-200 italic"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          title="Cursiva"
        >
          I
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 hover:bg-slate-200"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          title="Lista con viñetas"
        >
          • Viñetas
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <select
          className="max-w-[100px] rounded border border-slate-200 bg-white px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          onChange={(e) => {
            exec("fontName", e.target.value);
            e.target.value = ""; // Reset
          }}
          title="Fuente"
          defaultValue=""
        >
          <option value="" disabled>Fuente</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="Impact, sans-serif">Impact</option>
          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
        </select>

        <select
          className="max-w-[80px] rounded border border-slate-200 bg-white px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          onChange={(e) => {
            exec("fontSize", e.target.value);
            e.target.value = ""; // Reset
          }}
          title="Tamaño"
        >
          <option value="" disabled selected>Tamaño</option>
          <option value="1">Muy Pequeño</option>
          <option value="2">Pequeño</option>
          <option value="3">Normal</option>
          <option value="4">Mediano</option>
          <option value="5">Grande</option>
          <option value="6">Muy Grande</option>
          <option value="7">Enorme</option>
        </select>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          className={`rounded px-2 py-1 hover:bg-slate-200 ${showLinkInput ? "bg-slate-200 text-sky-600" : ""}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLinkInput}
          title="Enlace"
        >
          🔗 Link
        </button>
      </div>

      {showLinkInput && (
        <div className="flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 p-2 text-xs animate-in fade-in slide-in-from-top-1">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded border border-sky-200 px-2 py-1 text-slate-700 focus:border-sky-400 focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              } else if (e.key === "Escape") {
                cancelLink();
              }
            }}
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded bg-sky-600 px-3 py-1 text-white hover:bg-sky-700 font-medium"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={cancelLink}
            className="rounded text-slate-500 hover:text-slate-700 px-2"
          >
            ✕
          </button>
        </div>
      )}

      <div
        id={id}
        ref={ref}
        contentEditable
        className="min-h-[160px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500/40 focus:ring-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        onInput={handleInput}
        // Permite pegar HTML; se limpia en el backend antes de guardar.
        suppressContentEditableWarning
      />
      {name && (
        // Campo oculto para mantener compatibilidad con formularios/inputs estándar.
        <input
          type="hidden"
          name={name}
          value={value}
          readOnly
        />
      )}
    </div>
  );
};


