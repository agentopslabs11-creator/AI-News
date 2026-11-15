import re
import urllib.parse
from typing import Tuple, Dict, Any, List
from bs4 import BeautifulSoup, Comment

# Disallowed tag blacklist: tags that execute code or break out of sandboxing
DANGEROUS_TAGS = {
    "script", "noscript", "iframe", "object", "embed", "applet",
    "base", "form", "input", "button", "textarea", "select", "option",
    "meta", "link", "frame", "frameset"
}

# Allowed tags for newspaper layouts (rich editorial formatting)
ALLOWED_TAGS = {
    "html", "head", "body", "title", "style",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "span", "div", "section", "article", "header", "footer", "main", "aside", "nav",
    "b", "strong", "i", "em", "u", "s", "strike", "del", "ins", "small", "sub", "sup",
    "blockquote", "q", "cite", "pre", "code", "mark", "time",
    "ul", "ol", "li", "dl", "dt", "dd",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
    "img", "figure", "figcaption", "picture", "source", "svg", "path", "g", "circle", "rect", "line", "polyline", "polygon",
    "hr", "br", "wbr",
    "a"
}

# Dangerous protocols in links and sources
DISALLOWED_PROTOCOLS = {"javascript:", "data:", "vbscript:", "file:"}

# Safe CSS properties regex (prevent css expressions or url(javascript:...))
DANGEROUS_CSS_PATTERNS = re.compile(
    r"(expression\(|javascript:|behavior:|binding:|url\s*\(\s*['\"]?\s*javascript:)",
    re.IGNORECASE
)

class HTMLValidationError(Exception):
    """Raised when uploaded HTML content fails validation checks."""
    pass

class HTMLProcessor:
    @staticmethod
    def validate_and_sanitize(raw_content: bytes, max_size_mb: int = 5) -> Tuple[str, Dict[str, Any]]:
        """
        Validates encoding, file size, and sanitizes the HTML content.
        Returns: (sanitized_html_str, metadata_dict)
        """
        # 1. Size verification
        size_bytes = len(raw_content)
        max_bytes = max_size_mb * 1024 * 1024
        if size_bytes > max_bytes:
            raise HTMLValidationError(
                f"File size ({size_bytes / (1024*1024):.2f} MB) exceeds maximum allowed limit of {max_size_mb} MB"
            )
        
        if size_bytes == 0:
            raise HTMLValidationError("Uploaded file is empty.")

        # 2. UTF-8 Validation
        try:
            html_text = raw_content.decode("utf-8")
        except UnicodeDecodeError as err:
            try:
                # Attempt utf-8-sig (with BOM)
                html_text = raw_content.decode("utf-8-sig")
            except UnicodeDecodeError:
                raise HTMLValidationError(
                    "Invalid file encoding. Newspaper HTML files must be strictly encoded in UTF-8."
                ) from err

        # 3. Parse HTML with BeautifulSoup
        try:
            soup = BeautifulSoup(html_text, "html.parser")
        except Exception as e:
            raise HTMLValidationError(f"Could not parse HTML document: {str(e)}")

        # 4. Remove comments
        for comment in soup.find_all(text=lambda text: isinstance(text, Comment)):
            comment.extract()

        # 5. Remove dangerous tags
        for tag in soup.find_all(list(DANGEROUS_TAGS)):
            tag.decompose()

        # Remove unwanted page index navigation bars
        for nav in soup.find_all("nav"):
            classes = nav.get("class", [])
            if any("index" in str(c).lower() for c in classes) or nav.get("aria-label") == "Pages":
                nav.decompose()

        # 6. Sanitize attributes for all remaining tags
        external_images: List[str] = []
        headings: List[str] = []
        
        for element in soup.find_all(True):
            # Check tag name against allowlist
            if element.name.lower() not in ALLOWED_TAGS:
                # Unwrap non-allowed tag (keep its text content)
                element.unwrap()
                continue

            attrs_to_remove = []
            for attr_name, attr_val in list(element.attrs.items()):
                attr_name_lower = attr_name.lower()

                # Remove event handlers (onclick, onload, onerror, onmouseover, etc.)
                if attr_name_lower.startswith("on"):
                    attrs_to_remove.append(attr_name)
                    continue

                # Clean URLs in href and src
                if attr_name_lower in ("href", "src", "action", "data"):
                    if isinstance(attr_val, list):
                        attr_val_str = " ".join(attr_val).strip()
                    else:
                        attr_val_str = str(attr_val).strip()
                    
                    val_lower = attr_val_str.lower()
                    if any(val_lower.startswith(proto) for proto in DISALLOWED_PROTOCOLS):
                        attrs_to_remove.append(attr_name)
                        continue

                    # Track external images
                    if element.name.lower() == "img" and attr_name_lower == "src":
                        if attr_val_str.startswith("http://") or attr_val_str.startswith("https://"):
                            external_images.append(attr_val_str)

                # Sanitize inline styles
                if attr_name_lower == "style":
                    style_val = str(attr_val)
                    if DANGEROUS_CSS_PATTERNS.search(style_val):
                        attrs_to_remove.append(attr_name)

            for attr in attrs_to_remove:
                del element[attr]

            # Collect headings for metadata
            if element.name.lower() in ("h1", "h2", "h3") and element.get_text(strip=True):
                text = element.get_text(strip=True)
                if len(text) > 3 and text not in headings:
                    headings.append(text[:120])

        # 7. Extract document title
        doc_title = ""
        if soup.title and soup.title.string:
            doc_title = soup.title.string.strip()
        elif headings:
            doc_title = headings[0]

        # 8. Ensure basic wrapper structure if partial HTML
        sanitized_html = str(soup)
        if "<body" not in sanitized_html.lower():
            sanitized_html = (
                f"<!DOCTYPE html>\n<html>\n<head>\n"
                f"<meta charset=\"UTF-8\">\n"
                f"<title>{doc_title or 'Rise ’n’ Shine Edition'}</title>\n"
                f"<style>\n"
                f"  body {{ font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; color: #242424; background: #FFFFFF; }}\n"
                f"  img {{ max-width: 100%; height: auto; }}\n"
                f"</style>\n"
                f"</head>\n<body>\n{sanitized_html}\n</body>\n</html>"
            )

        metadata = {
            "title": doc_title,
            "headings_count": len(headings),
            "sample_headings": headings[:5],
            "external_images_count": len(external_images),
            "content_size_bytes": len(sanitized_html.encode("utf-8")),
            "sanitized": True
        }

        return sanitized_html, metadata
