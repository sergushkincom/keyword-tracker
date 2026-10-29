function Chip({ className, children }: { className: string; children: string }) {
  return <span className={`inline-flex h-5 items-center rounded-chip px-1 text-cell ${className}`}>{children}</span>
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-cell text-fg-tertiary">{label}</p>
      <p className="tabular-nums text-fg-primary">{value}</p>
    </div>
  )
}

export function ProductCard() {
  return (
    <section className="flex shrink-0 items-center gap-3 rounded-card border border-border-primary bg-bg-primary p-3">
      <div className="h-16 w-16 shrink-0 rounded-chip bg-bg-tertiary" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 leading-5">Hydrating Cream Cleanser, Fragrance Free, 12 fl oz</p>
        <div className="mt-2 flex flex-wrap gap-1">
          <Chip className="bg-bg-tertiary text-fg-secondary">B0CKIN0001</Chip>
          <Chip className="bg-bg-success-tertiary text-fg-success-primary">Coupon</Chip>
          <Chip className="bg-bg-brand-tertiary text-fg-brand-primary">Best seller</Chip>
        </div>
      </div>
      <div className="w-px self-stretch bg-border-primary" />
      <div className="flex gap-6 pr-2">
        <Stat label="Current price" value="$75.00" />
        <Stat label="Discount" value="10%" />
      </div>
    </section>
  )
}
