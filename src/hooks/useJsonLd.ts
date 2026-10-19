import { useEffect } from "react";

export function useJsonLd(schema: Record<string, unknown>, id = "jsonld-main") {
  useEffect(() => {
    const json = JSON.stringify(schema);
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = json;
    return () => { document.getElementById(id)?.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}
