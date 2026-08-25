import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Professional } from './types';

interface Props {
  professionals: Professional[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function ProfessionalFilter({
  professionals, selectedIds, onToggle, onSelectAll,
  collapsed, onToggleCollapse,
}: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: "'Lato', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: collapsed ? '14px 8px' : '14px 12px',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '8px',
      }}>
        {!collapsed && (
          <p style={{
            fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#069494', margin: 0,
          }}>
            Profesionales
          </p>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expandir' : 'Colapsar'}
          style={{
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: '#069494',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2px', borderRadius: '4px', flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Lista */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: collapsed ? '8px 4px' : '8px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        <FilterRow
          label="Todos"
          color="#1a1a1a"
          checked={selectedIds.length === professionals.length}
          onChange={onSelectAll}
          isBold
          collapsed={collapsed}
        />

        <div style={{ height: '1px', background: '#e8e8e8', margin: collapsed ? '4px 2px' : '4px 6px' }} />

        {professionals.map(p => (
          <FilterRow
            key={p.id}
            label={p.name}
            color={p.color}
            checked={selectedIds.includes(p.id)}
            onChange={() => onToggle(p.id)}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}

function FilterRow({ label, color, checked, onChange, isBold, collapsed }: {
  label: string;
  color: string;
  checked: boolean;
  onChange: () => void;
  isBold?: boolean;
  collapsed: boolean;
}) {
  return (
    <label
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '8px',
        padding: collapsed ? '8px 4px' : '7px 6px',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />

      <div style={{
        width: '14px', height: '14px', borderRadius: '4px', flexShrink: 0,
        background: checked ? color : 'transparent',
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}>
        {checked && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {!collapsed && (
        <span style={{
          fontSize: '14px',
          color: checked ? '#000' : '#000',
          fontWeight: isBold ? 600 : checked ? 500 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          flex: 1,
        }}>
          {label}
        </span>
      )}

      {!collapsed && (
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: color, flexShrink: 0,
          opacity: checked ? 1 : 0.25,
        }} />
      )}
    </label>
  );
}