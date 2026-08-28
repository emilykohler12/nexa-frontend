//src/pages/admin/services/ServiceList.tsx

import { useState, useMemo } from 'react';
import { Pencil, Trash2, ImageOff, Search } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';
import type { AdminService } from './types';
import './services.css';

interface CategoryOption {
  id: string;
  label: string;
}

interface Props {
  services: AdminService[];
  categories: CategoryOption[];
  onEdit: (service: AdminService) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenZones: (service: AdminService) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc',   label: 'Nombre (A-Z)'      },
  { value: 'name-desc',  label: 'Nombre (Z-A)'      },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
];

function sortServices(services: AdminService[], sortBy: SortOption): AdminService[] {
  const arr = [...services];
  switch (sortBy) {
    case 'name-asc':   return arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    case 'name-desc':  return arr.sort((a, b) => b.name.localeCompare(a.name, 'es'));
    case 'price-asc':  return arr.sort((a, b) => a.price - b.price);
    case 'price-desc': return arr.sort((a, b) => b.price - a.price);
  }
}

export function ServiceList({ services, categories, onEdit, onDelete, onToggleStatus, onOpenZones }: Props) {
  const [query,  setQuery]  = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  const categoryLabel = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.label ?? categoryId;

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = normalizedQuery
      ? services.filter((s) => s.name.toLowerCase().includes(normalizedQuery))
      : services;

    const result: { key: string; label: string; services: AdminService[] }[] = [];

    categories.forEach((cat) => {
      const inCategory = matches.filter(
        (s) => s.categoryId === cat.id && s.status === 'active' && !s.isCombo
      );
      if (inCategory.length > 0) {
        result.push({ key: cat.id, label: cat.label, services: sortServices(inCategory, sortBy) });
      }
    });

    const combos = matches.filter((s) => s.isCombo && s.status === 'active');
    if (combos.length > 0) {
      result.push({ key: 'combos', label: 'Combos', services: sortServices(combos, sortBy) });
    }

    const inactive = matches.filter((s) => s.status === 'inactive');
    if (inactive.length > 0) {
      result.push({ key: 'inactive', label: 'Inactivos', services: sortServices(inactive, sortBy) });
    }

    return result;
  }, [services, categories, query, sortBy]);

  if (services.length === 0) {
    return <p className="service-table-empty">Todavía no cargaste ningún servicio.</p>;
  }

  return (
    <div className="service-list">
      {/* Buscador + orden */}
      <div className="service-list-toolbar">
        <div className="service-search-wrap">
          <Search size={16} className="service-search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar servicio por nombre..."
            className="service-search-input"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="service-sort-select"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {groups.length === 0 ? (
        <p className="service-table-empty">No se encontraron servicios para "{query}"</p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="service-group">
            <p className="service-group-label">
              {group.label} ({group.services.length})
            </p>
            <div className="service-cards-grid">
              {group.services.map((service) => (
                <div
                  key={service.id}
                  className="admin-service-card"
                  style={{ opacity: service.status === 'active' ? 1 : 0.65, cursor: service.isSpecial ? 'pointer' : 'default' }}
                  onClick={() => service.isSpecial && onOpenZones(service)}
                  title={service.isSpecial ? 'Tocá para configurar zonas y paquetes' : undefined}
                >
                  <div className="admin-service-card-top">
                    <div className="service-table-thumb">
                      {service.image ? <img src={service.image} alt={service.name} /> : <ImageOff size={18} />}
                    </div>
                    <div className="admin-service-card-info">
                      <p className="service-table-name">
                        {service.name}
                        {service.isSpecial && (
                          <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 700, color: '#d4af37', background: 'rgba(212,175,55,0.12)', padding: '2px 8px', borderRadius: '20px', verticalAlign: 'middle' }}>
                            Especial
                          </span>
                        )}
                      </p>
                      <p className="admin-service-card-meta">
                        {service.isSpecial
                          ? `${categoryLabel(service.categoryId)} · ${service.specialDate ?? 'sin fecha'}`
                          : `${categoryLabel(service.categoryId)} · ${service.duration} min`}
                      </p>
                    </div>
                    <div className="admin-service-card-actions" onClick={e => e.stopPropagation()}>
                      <button className="admin-icon-button" onClick={() => onEdit(service)} title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button className="admin-icon-button danger" onClick={() => onDelete(service.id)} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="service-table-description admin-service-card-desc">{service.description}</p>

                  <div className="admin-service-card-bottom" onClick={e => service.isSpecial && e.stopPropagation()}>
                    <span className="admin-service-card-price">
                      {service.isSpecial
                        ? (service.zones?.length ? `${service.zones.length} zona${service.zones.length !== 1 ? 's' : ''}` : 'Sin zonas todavía')
                        : formatCurrency(service.price)}
                    </span>
                    <button
                      className={`admin-status-badge ${service.status}`}
                      onClick={() => onToggleStatus(service.id)}
                      title="Clic para cambiar el estado"
                    >
                      {service.status === 'active' ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
