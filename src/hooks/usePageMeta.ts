import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

function setMeta(selector: string, attrKey: string, attrVal: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrKey, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({ title, description, canonical, ogImage }: PageMetaOptions) {
  useEffect(() => {
    document.title = title;

    setMeta('meta[name="description"]',          "name",     "description",          description);
    setMeta('meta[property="og:title"]',         "property", "og:title",             title);
    setMeta('meta[property="og:description"]',   "property", "og:description",       description);
    setMeta('meta[name="twitter:title"]',        "name",     "twitter:title",        title);
    setMeta('meta[name="twitter:description"]',  "name",     "twitter:description",  description);

    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    if (ogImage) {
      setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      setMeta('meta[name="twitter:image"]', "name",    "twitter:image", ogImage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, ogImage]);
}
