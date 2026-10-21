import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AppShell from "@/components/feature/AppShell";
import { fetchProducts, type ShopProduct } from "@/lib/products";
import VialIcon from "@/components/feature/VialIcon";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function MemberGate({ onJoin }: { onJoin: () => void }) {
  const [email, setEmail]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "shop-gate" }),
      });
    } catch { /* silent — gate still opens */ }
    try { localStorage.setItem("vc-member", "true"); } catch { /* ignore */ }
    setSubmitting(false);
    onJoin();
  }

  return (
    <div className="flex flex-col items-center px-2 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <i className="ri-vip-crown-2-line text-3xl text-primary-500" />
      </div>
      <h2 className="font-heading text-xl font-bold text-foreground-950">
        Members get 30% off everything
      </h2>
      <p className="mt-2 max-w-xs text-sm text-foreground-500">
        Drop your email to unlock shop access and your permanent 30% member discount.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-xs space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-2xl border border-background-200 bg-background-50 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <button
          type="submit"
          disabled={submitting || !email}
          className="w-full rounded-full bg-primary-500 py-3.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "Joining…" : "Unlock my 30% off →"}
        </button>
      </form>
      <p className="mt-4 text-[11px] text-foreground-400">No spam. Unsubscribe any time.</p>
    </div>
  );
}

function ProductCard({ p }: { p: ShopProduct }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-background-100 bg-white shadow-sm">
      {/* Image / vial */}
      {p.imageUrl ? (
        <img
          src={p.imageUrl}
          alt={`${p.name} ${p.variantLabel}`}
          className="h-40 w-full object-cover bg-background-50"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-gradient-to-b from-background-50 to-background-100">
          <VialIcon
            categorySlug={p.categorySlug}
            size={68}
            label={p.name}
            sublabel={p.variantLabel}
            coaUrl={p.coas[0]?.url}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-3">
        <p className="font-heading text-sm font-bold text-foreground-950 leading-tight">
          {p.name}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold text-primary-600">{p.variantLabel}</p>
        {p.purity && (
          <p className="mt-0.5 text-[10px] text-foreground-400">{p.purity} purity</p>
        )}
        {p.shortDescription && (
          <p className="mt-1.5 text-[11px] text-foreground-500 leading-tight line-clamp-2">
            {p.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-3">
          <p className="font-heading text-base font-bold text-foreground-950">
            {formatPrice(p.priceCents)}
          </p>
          <div className="mt-2 space-y-1.5">
            <a
              href={p.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full bg-primary-500 py-2.5 text-center text-sm font-bold text-white active:scale-[0.97]"
            >
              Order Now
            </a>
            {p.coas.length > 0 && (
              <a
                href={p.coas[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-background-100 py-2 text-xs font-medium text-foreground-400 active:bg-background-50"
                title="Certificate of Analysis"
              >
                <i className="ri-file-text-line" />
                View COA
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [isMember, setIsMember] = useState(() => {
    try { return !!localStorage.getItem("vc-member"); } catch { return false; }
  });
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedGroup = searchParams.get("peptide") ?? "all";

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchProducts()
      .then(setProducts)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // derive unique peptide groups for filter pills
  const groups = ["all", ...Array.from(new Set(products.map((p) => p.variantGroup)))];

  const visible =
    selectedGroup === "all"
      ? products
      : products.filter((p) => p.variantGroup === selectedGroup);

  function filterLabel(g: string) {
    if (g === "all") return "All";
    return products.find((p) => p.variantGroup === g)?.name ?? g;
  }

  if (!isMember) {
    return (
      <AppShell title="Shop">
        <MemberGate onJoin={() => setIsMember(true)} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Shop">
      {/* Filter pills */}
      {!loading && !error && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-4 scrollbar-none">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() =>
                g === "all"
                  ? setSearchParams({})
                  : setSearchParams({ peptide: g })
              }
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors active:scale-[0.97] ${
                selectedGroup === g
                  ? "bg-primary-500 text-white"
                  : "bg-background-100 text-foreground-600"
              }`}
            >
              {filterLabel(g)}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-background-100" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center py-16 text-center">
          <i className="ri-store-2-line text-5xl text-foreground-200" />
          <p className="mt-3 font-heading text-base font-bold text-foreground-950">
            Couldn't load products
          </p>
          <p className="mt-1 text-sm text-foreground-400">Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => { setError(false); setLoading(true); fetchProducts().then(setProducts).catch(() => setError(true)).finally(() => setLoading(false)); }}
            className="mt-4 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white active:scale-[0.97]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty filtered state */}
      {!loading && !error && visible.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <i className="ri-flask-2-line text-5xl text-foreground-200" />
          <p className="mt-3 text-sm text-foreground-500">No products found for this peptide.</p>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="mt-3 text-sm font-semibold text-primary-600"
          >
            Show all
          </button>
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && visible.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {visible.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>

          {/* Footer note */}
          <p className="mt-6 pb-4 text-center text-[11px] text-foreground-300">
            All products are for research purposes only.
          </p>
        </>
      )}
    </AppShell>
  );
}
