import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportMenuProps {
  onExport: (format: 'pdf' | 'excel') => void;
  disabled?: boolean;
}

export function ExportMenu({ onExport, disabled }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = (format: 'pdf' | 'excel') => {
    onExport(format);
    setOpen(false);
  };

  return (
    <div className="export-menu" ref={ref}>
      <button
        type="button"
        className="btn btn--ghost"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download size={15} /> Exportar <ChevronDown size={14} />
      </button>
      {open && (
        <div className="export-menu__dropdown" role="menu">
          <button type="button" role="menuitem" onClick={() => pick('pdf')}>
            <FileText size={15} /> PDF
          </button>
          <button type="button" role="menuitem" onClick={() => pick('excel')}>
            <FileSpreadsheet size={15} /> Excel
          </button>
        </div>
      )}
    </div>
  );
}
