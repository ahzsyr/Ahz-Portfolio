export default function PageHeader({ title, description, actions }) {
  return (
    <div className="sticky top-0 z-10 -mx-6 md:-mx-8 px-6 md:px-8 py-4 mb-4 bg-slate-100/95 backdrop-blur border-b border-slate-200/80 flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>
      )}
    </div>
  );
}
