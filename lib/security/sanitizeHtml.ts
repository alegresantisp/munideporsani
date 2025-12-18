import DOMPurify from "isomorphic-dompurify";

export const sanitizeHtml = (html: string): string => {
  // Config conservadora: permitimos etiquetas básicas de contenido.
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "a",
      "br",
      "h2",
      "h3",
      "h4",
      "blockquote",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
};


