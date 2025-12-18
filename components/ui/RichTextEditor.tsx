"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  const exec = (command: string) => {
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand(command, false);
    handleInput();
  };

  const handleLink = () => {
    // eslint-disable-next-line no-alert
    const url = window.prompt("Ingresá la URL del enlace:");
    if (!url) return;
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand("createLink", false, url);
    handleInput();
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950/40 px-2 py-1 text-[11px] text-slate-200">
        <button
          type="button"
          className="rounded px-1 hover:bg-slate-800"
          onClick={() => exec("bold")}
        >
          Negrita
        </button>
        <button
          type="button"
          className="rounded px-1 hover:bg-slate-800"
          onClick={() => exec("italic")}
        >
          Cursiva
        </button>
        <button
          type="button"
          className="rounded px-1 hover:bg-slate-800"
          onClick={() => exec("insertUnorderedList")}
        >
          Lista
        </button>
        <button
          type="button"
          className="rounded px-1 hover:bg-slate-800"
          onClick={handleLink}
        >
          Enlace
        </button>
      </div>
      <div
        id={id}
        ref={ref}
        contentEditable
        className="min-h-[160px] rounded-md border border-slate-700 bg-slate-950/40 px-2 py-1.5 text-xs text-slate-50 outline-none ring-sky-500/40 focus:ring-2"
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


