import { equipment } from "@/mocks/guides";

export default function EquipmentCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
      <div className="border-b border-background-200 px-5 py-3">
        <span className="font-heading text-sm font-semibold text-foreground-950">
          Research Equipment
        </span>
      </div>
      <div className="divide-y divide-background-100">
        {equipment.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-background-100"
          >
            <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-background-200 bg-background-100">
              <img
                src={item.image}
                alt={item.name}
                title={`${item.name} — research equipment for peptide preparation`}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground-900">
                {item.name}
              </span>
              <span className="block truncate text-xs text-foreground-600">{item.spec}</span>
            </span>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground-400"
              aria-hidden="true"
            >
              <i className="ri-arrow-right-up-line text-base"></i>
            </span>
          </a>
        ))}
      </div>
      <p className="border-t border-background-100 px-5 py-3 text-[11px] text-foreground-500">
        Links to external retailers. We don't sell any of these.
      </p>
    </div>
  );
}