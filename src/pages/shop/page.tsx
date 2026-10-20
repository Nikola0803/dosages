import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppShell from "@/components/feature/AppShell";
import { fetchProducts, type ShopProduct } from "@/lib/products";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function ProductCard({ p }: { p: ShopProduct }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-background-100 bg-white shadow-sm">
      {/* Image */}
      {p.imageUrl ? (
        <img
          src={p.imageUrl}
          alt={`${p.name} ${p.variantLabel}`}
          className="h-36 w-full object-cover bg-background-50"
        />
      ) : (
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary-50 to-background-100">
          <i className="ri-flask-2-line text-4xl text-primary-300" />
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
          <div className="mt-2 flex gap-1.5">
            <a
              href={p.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full bg-primary-500 py-2 text-center text-xs font-semibold text-white active:scale-[0.97]"
            >
              Buy now
            </a>
            {p.coas.length > 0 && (
              <a
                href={p.coas[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-full border border-background-200 px-2.5 py-2 text-xs font-semibold text-foreground-600 active:scale-[0.97]"
                title="Certificate of Analysis"
              >
                <i className="ri-file-text-line text-sm" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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
