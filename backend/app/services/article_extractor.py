"""
article_extractor.py
--------------------
Extracts authentic newspaper news cuts (clippings) directly from a published
newspaper edition's HTML content and populates the articles table.

Each extracted article captures:
- The exact story headline
- The authentic subdeck / deck
- The section name / category
- The kicker / eyebrow
- The full body paragraphs with drop caps
- The source citations and reported badge
- An authentic newspaper cut HTML snippet for broadsheet card rendering

Called automatically whenever an edition is uploaded (status=published)
or explicitly replaced/published via the admin dashboard.
"""
import re
import html
import unicodedata
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.models.article  import Article
from app.models.category import Category


# ---------------------------------------------------------------------------
# Slug helper
# ---------------------------------------------------------------------------

def _slugify(text: str, max_len: int = 280) -> str:
    clean_ascii = re.sub(r"[^\w\s-]", "", unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")).strip().lower()
    clean_ascii = re.sub(r"[\s_-]+", "-", clean_ascii).strip("-")
    letters_only = re.sub(r"[\d-]", "", clean_ascii)
    if len(letters_only) < 3:
        import hashlib
        h = hashlib.md5(text.encode("utf-8")).hexdigest()[:10]
        return f"story-{h}"[:max_len]
    return clean_ascii[:max_len]


def _unique_slug(base: str, db: Session, used_in_batch: set) -> str:
    slug = base
    counter = 1
    while slug in used_in_batch or db.query(Article).filter(Article.slug == slug).first():
        slug = f"{base}-{counter}"
        counter += 1
    used_in_batch.add(slug)
    return slug


# ---------------------------------------------------------------------------
# Category helpers
# ---------------------------------------------------------------------------

def _get_or_create_category(name: str, language: str, db: Session) -> Optional[int]:
    clean_name = name.strip()
    slug = _slugify(f"{clean_name}-{language}")
    cat = db.query(Category).filter((Category.slug == slug) | (Category.name == clean_name)).first()
    if not cat:
        cat = Category(name=clean_name, slug=slug, language=language)
        db.add(cat)
        db.flush()
    return cat.id


# ---------------------------------------------------------------------------
# Main extraction logic - extracts authentic newspaper cuts
# ---------------------------------------------------------------------------

def extract_articles_from_edition(
    edition_id: int,
    html_content: str,
    language: str,
    publication_date,
    db: Session,
    max_articles: int = 20,
    delete_previous_for_language: bool = True,
) -> List[Article]:
    """
    Parses broadsheet HTML, extracts the real stories (headlines, decks, kickers,
    multi-column paragraphs, and sources), formats them as authentic newspaper cuts,
    and saves them to the articles table.
    """
    # 1. Delete previous articles to ensure latest news wire is clean
    if delete_previous_for_language:
        db.query(Article).filter(Article.language == language).delete(synchronize_session=False)
        db.flush()
    else:
        db.query(Article).filter(Article.edition_id == edition_id).delete(synchronize_session=False)
        db.flush()

    soup = BeautifulSoup(html_content, "html.parser")

    # Decompose global non-story elements
    for tag in soup.find_all(["nav", "footer"]):
        tag.decompose()

    skip_titles = [
        "the ai news paper", "rise ’n’ shine", "rise n shine", "editorial desk",
        "daily edition", "national circulation", "watch this week", "money briefs",
        "security watch", "sources & notes", "tools and what they cost", "new models this week",
        "for it professionals: what to learn next", "ai tools for your job hunt",
        "beware of job scams", "your job-hunt checklist this week"
    ]

    extracted_stories = []
    seen_titles = set()

    # -----------------------------------------------------------------------
    # Strategy 1: Parse sheet by sheet to associate each story with its section
    # -----------------------------------------------------------------------
    sheets = soup.find_all(class_="sheet")
    if not sheets:
        sheets = [soup]

    for s_idx, sheet in enumerate(sheets):
        # 1. Detect section name from pagehead and sheet anchor
        page_num = s_idx + 1
        sheet_id = sheet.get("id") or f"sheet-{page_num}"

        pagehead = sheet.find(class_="pagehead")
        sec_name = None
        if pagehead:
            h_ph = pagehead.find(["h2", "h1", "h3"])
            if h_ph:
                sec_name = h_ph.get_text(strip=True)

        if not sec_name:
            sec_name = "Front Page" if s_idx == 0 else f"Section {s_idx + 1}"

        # 2. Find story blocks (hero, story, lead-grid) inside this sheet
        story_blocks = sheet.find_all(
            ["section", "article", "div"],
            class_=lambda c: c and any(k in c for k in ["hero", "story", "lead-grid"]) and not any(k in c for k in ["pagehead", "masthead", "sources-box", "tools-box"])
        )

        for block in story_blocks:
            # Find headline element inside this story block
            h = block.find(["h3", "h2", "h1", "h4"])
            if not h:
                continue
            title = h.get_text(strip=True)
            if len(title) < 15 or any(s in title.lower() for s in skip_titles):
                continue
            if sec_name and title.lower() == sec_name.lower():
                continue
            if title in seen_titles:
                continue
            seen_titles.add(title)

            # Eyebrow / Kicker
            eyebrow_el = block.find(class_=lambda c: c and "eyebrow" in c)
            eyebrow = eyebrow_el.get_text(strip=True) if eyebrow_el else None

            # Deck / Subdeck
            deck_el = block.find(class_=lambda c: c and ("deck" in c or "lead" in c or "sub" in c))
            deck = deck_el.get_text(strip=True) if deck_el else None

            # Body paragraphs
            body_el = block.find(class_=lambda c: c and ("body" in c or "cols" in c or "copy" in c))
            raw_paras = body_el.find_all("p") if body_el else block.find_all("p")
            paras = []
            for p in raw_paras:
                t = p.get_text(strip=True)
                if len(t) > 20 and p != deck_el and p != eyebrow_el and not t.lower().startswith("sources:"):
                    paras.append(t)

            # Sources line
            src_el = block.find(class_=lambda c: c and ("src" in c or "source" in c))
            src = src_el.get_text(strip=True) if src_el else "Sources: Official Broadsheet Correspondent Network [REPORTED]"

            if not paras and not deck:
                continue

            extracted_stories.append({
                "title": title,
                "section": sec_name,
                "eyebrow": eyebrow,
                "deck": deck or (paras[0][:250] if paras else title),
                "paras": paras if paras else [deck],
                "sources": src,
                "sheet_id": sheet_id,
                "page_num": page_num,
            })

    # -----------------------------------------------------------------------
    # Strategy 2: Fallback for generic broadsheets (simple HTML headings)
    # -----------------------------------------------------------------------
    if len(extracted_stories) < 3:
        for h in soup.find_all(["h1", "h2", "h3", "h4"]):
            text = h.get_text(strip=True)
            if len(text) < 15 or any(s in text.lower() for s in skip_titles):
                continue
            if text in seen_titles:
                continue
            seen_titles.add(text)

            body_parts = []
            for sibling in h.find_next_siblings():
                if sibling.name in ("h1", "h2", "h3", "h4"):
                    break
                if sibling.name in ("p", "div", "blockquote"):
                    t = sibling.get_text(strip=True)
                    if t and len(t) > 20:
                        body_parts.append(t)
                if len(body_parts) >= 6:
                    break

            if body_parts:
                deck_fallback = body_parts[0] if len(body_parts) > 1 else text
                paras_fallback = body_parts[1:] if len(body_parts) > 1 else body_parts
                extracted_stories.append({
                    "title": text,
                    "section": "News Dispatch",
                    "eyebrow": None,
                    "deck": deck_fallback[:250],
                    "paras": paras_fallback,
                    "sources": "Sources: Official Broadsheet Correspondent Network [REPORTED]",
                })

    top_stories = extracted_stories[:max_articles]
    articles_created = []
    used_in_batch = set()

    for idx, story in enumerate(top_stories):
        title = story["title"]
        sec_name = story["section"]
        kicker_text = story["eyebrow"]
        deck_text = story["deck"]
        paras = story["paras"]
        src_text = story["sources"]

        # Category
        category_id = _get_or_create_category(sec_name, language, db)

        # Build Drop Cap on first paragraph
        first_p = paras[0] if paras else title
        first_letter = first_p[0] if first_p else "T"
        rest_of_first_p = first_p[1:] if len(first_p) > 1 else ""

        # Build clean HTML body paragraphs with drop cap on the first paragraph
        body_html_parts = [
            f'<p><span class="newspaper-cut-dropcap">{first_letter}</span>{html.escape(rest_of_first_p)}</p>'
        ]
        for p in paras[1:]:
            body_html_parts.append(f'<p>{html.escape(p)}</p>')
        body_html = "\n".join(body_html_parts)

        # Sheet and Page info
        story_sheet = story.get("sheet_id", "sheet-1")
        story_page = story.get("page_num", 1)

        # Authentic Newspaper Cut HTML (exact clipping layout from Image 2)
        cut_html = f"""<div class="newspaper-cut" data-section="{html.escape(sec_name)}" data-kicker="{html.escape(kicker_text or '')}" data-sources="{html.escape(src_text)}" data-sheet="{html.escape(str(story_sheet))}" data-page="{story_page}">
  <div class="newspaper-cut-header">
    <div class="newspaper-cut-section">{html.escape(sec_name)}</div>
    <div class="newspaper-cut-page">Page {story_page}</div>
    <div class="newspaper-cut-rule"></div>
  </div>
  {f'<p class="newspaper-cut-eyebrow">{html.escape(kicker_text)}</p>' if kicker_text else ''}
  <h1 class="newspaper-cut-headline">{html.escape(title)}</h1>
  <p class="newspaper-cut-deck">{html.escape(deck_text)}</p>
  <div class="newspaper-cut-body">
    {body_html}
  </div>
  <div class="newspaper-cut-sources">
    <span class="sources-text">{html.escape(src_text)}</span>
    <span class="reported-badge">REPORTED</span>
  </div>
</div>"""

        # Build unique slug
        date_str = str(publication_date)
        base_slug = _slugify(f"{title}-{date_str}")
        slug = _unique_slug(base_slug, db, used_in_batch)

        is_breaking = (idx == 0)
        is_featured = (idx < 4)

        article = Article(
            edition_id   = edition_id,
            title        = title,
            slug         = slug,
            language     = language,
            description  = deck_text[:300],
            content      = cut_html,
            category_id  = category_id,
            status       = "published",
            is_breaking  = is_breaking,
            is_featured  = is_featured,
        )
        db.add(article)
        db.flush()
        articles_created.append(article)

    db.commit()

    for art in articles_created:
        db.refresh(art)

    return articles_created
