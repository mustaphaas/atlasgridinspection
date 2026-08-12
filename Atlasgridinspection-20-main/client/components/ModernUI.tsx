import type { ComponentType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export type IconComponent = ComponentType<{ size?: number; className?: string }>;

export function PageTitle({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="ag-page-title">
      <div className="ag-page-title-copy">
        {eyebrow && <div className="ag-eyebrow"><span />{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {meta && <div className="ag-page-meta">{meta}</div>}
      </div>
      {actions && <div className="ag-page-actions">{actions}</div>}
    </header>
  );
}

export function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "green",
  onClick,
  badge,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: IconComponent;
  tone?: "green" | "mint" | "amber" | "rose" | "slate" | "blue";
  onClick?: () => void;
  badge?: string;
}) {
  const content = (
    <>
      <span className="ag-kpi-icon"><Icon size={20} /></span>
      <small>{label}</small>
      <strong>{value}</strong>
      <p>{detail}</p>
      {badge && <em>{badge}</em>}
    </>
  );
  return onClick ? (
    <button type="button" className={`ag-kpi ag-kpi-${tone}`} onClick={onClick}>{content}</button>
  ) : (
    <div className={`ag-kpi ag-kpi-${tone}`} tabIndex={0} aria-label={`${label}: ${value}. ${detail}`}>{content}</div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ag-panel ${className}`}>
      <header className="ag-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const className = status.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <span className={`ag-status ag-status-${className}`}>{status}</span>;
}

export function TextLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="ag-text-link" onClick={onClick}>
      {children}<ArrowRight size={14} />
    </button>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="ag-empty-state">
      <div className="ag-empty-orbit"><span /></div>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, wide = false }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="ag-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`ag-modal ${wide ? "ag-modal-wide" : ""}`} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </header>
        {children}
      </section>
    </div>
  );
}
