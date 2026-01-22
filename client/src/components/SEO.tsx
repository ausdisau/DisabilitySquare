import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
}

function setOrCreateMeta(property: string, content: string, isOg: boolean = false) {
  const selector = isOg 
    ? `meta[property="${property}"]`
    : `meta[name="${property}"]`;
  
  let meta = document.querySelector(selector);
  if (meta) {
    meta.setAttribute("content", content);
  } else {
    meta = document.createElement("meta");
    if (isOg) {
      meta.setAttribute("property", property);
    } else {
      meta.setAttribute("name", property);
    }
    meta.setAttribute("content", content);
    document.head.appendChild(meta);
  }
}

export function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | DisabilitySquare`;
    document.title = fullTitle;
    
    setOrCreateMeta("description", description);
    setOrCreateMeta("og:title", fullTitle, true);
    setOrCreateMeta("og:description", description, true);
    setOrCreateMeta("og:type", "website", true);
    setOrCreateMeta("og:site_name", "DisabilitySquare", true);
  }, [title, description]);

  return null;
}
