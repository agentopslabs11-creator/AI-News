import sys
from app.core.database import SessionLocal
from app.models.article import Article
from app.models.newspaper import NewspaperEdition
from app.models.category import Category

db = SessionLocal()

# Find tech category
tech_cat = db.query(Category).filter(Category.slug == 'technology').first() or db.query(Category).first()

# 1. Update or create the Microsoft Outage Article
slug = 'microsoft-outage-copilot-outlook-teams-claude'
title = "Microsoft's two-day outage knocks out Copilot, Outlook and Teams, and pulls Claude down with it"
desc = "Millions of offices learned how much daily work now runs through cloud AI assistants, and what happens when they stop."
content = """A Microsoft 365 failure that began on November 12 ran into a second day. Outlook, Teams, SharePoint and Microsoft 365 Copilot were hit worldwide; users could not load Copilot Chat, and Copilot could not reach work email or files. Some regions were still waiting for full recovery on day two.

Microsoft said it was "deeply sorry" and called it "a technical issue not related to cyber or AI / agents", traced to an earlier network capacity upgrade. A full report is promised.

It spread to other AI tools. On November 13 Claude.ai had a major outage and Claude Code was partly down after Anthropic's Microsoft 365 connector began failing; Downdetector logged about 3,800 reports. The Claude API kept running, and Anthropic reported recovery later.

Why it matters to you: if your work, your shop or your freelance service depends on one AI or cloud tool, keep offline copies of key files and a second tool you know how to use.

Sources: CNBC • Windows Central • Washington Post • ABC News • Business Today • Android Authority • Cybernews"""

art = db.query(Article).filter(Article.slug == slug).first()
if not art:
    art = Article(
        title=title,
        slug=slug,
        description=desc,
        content=content,
        image_url='https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        category_id=tech_cat.id if tech_cat else None,
        language='en',
        status='published',
        is_breaking=True,
        is_featured=True
    )
    db.add(art)
else:
    art.title = title
    art.description = desc
    art.content = content
    art.is_breaking = True
    art.is_featured = True

# Also ensure it is top breaking article by created_at
db.commit()
print('[OK] Article created/updated in database.')

# 2. Update English broadsheet HTML in NewspaperEdition
ed = db.query(NewspaperEdition).filter(NewspaperEdition.language == 'en').order_by(NewspaperEdition.publication_date.desc()).first()
if ed:
    broadsheet_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rise ’n’ Shine – English Daily Broadsheet</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      margin: 0;
      padding: 30px;
      background-color: #FFFFFF;
      color: #242424;
      line-height: 1.5;
    }
    .newspaper-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      border: 1px solid #EEEEEE;
      padding: 35px;
      background: #FFFFFF;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    .masthead {
      text-align: center;
      border-bottom: 3px double #242424;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .masthead-title {
      font-size: 56px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #1719D9;
      margin: 0;
    }
    .masthead-subtitle {
      font-size: 14px;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-family: sans-serif;
      color: #747474;
      margin-top: 6px;
    }
    .dateline-bar {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #EEEEEE;
      border-bottom: 2px solid #242424;
      padding: 8px 0;
      font-family: sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 25px;
    }
    .headline-main {
      font-size: 42px;
      font-weight: 900;
      line-height: 1.15;
      color: #1719D9;
      margin: 0 0 14px 0;
      text-align: center;
      cursor: pointer;
    }
    .headline-main:hover {
      text-decoration: underline;
    }
    .subdeck {
      font-size: 20px;
      font-style: italic;
      color: #555555;
      text-align: center;
      max-width: 880px;
      margin: 0 auto 28px auto;
      line-height: 1.4;
    }
    .lead-story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 35px;
      font-size: 15.5px;
      text-align: justify;
      line-height: 1.6;
    }
    .left-col {
      border-right: 1px solid #E8E5DE;
      padding-right: 28px;
    }
    .left-col p:first-of-type::first-letter {
      font-size: 58px;
      float: left;
      line-height: 0.8;
      margin-right: 8px;
      color: #1719D9;
      font-weight: bold;
      font-family: serif;
    }
    .callout-box {
      border-left: 3px solid #1719D9;
      background: #F8F9FA;
      padding: 12px 16px;
      margin-top: 16px;
      font-size: 14px;
    }
    .sources-line {
      border-top: 1px solid #EEEEEE;
      padding-top: 10px;
      margin-top: 25px;
      font-family: sans-serif;
      font-size: 11px;
      color: #747474;
    }
    .sources-line a {
      color: #1719D9;
      text-decoration: underline;
    }
    .section-divider {
      border: 0;
      height: 1px;
      background: #EEEEEE;
      margin: 30px 0;
    }
    .bottom-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
    }
    .grid-story h4 {
      font-size: 18px;
      color: #1719D9;
      margin: 0 0 8px 0;
    }
    .grid-story p {
      font-size: 13.5px;
      color: #444444;
      margin: 0;
      text-align: justify;
    }
    .category-badge {
      display: inline-block;
      background: #C6FD04;
      color: #242424;
      font-family: sans-serif;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 3px 8px;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="newspaper-container">
    <header class="masthead">
      <h1 class="masthead-title">Rise ’n’ Shine</h1>
      <div class="masthead-subtitle">The AI Newspaper • Independent Global Broadsheet</div>
    </header>

    <div class="dateline-bar">
      <span>Vol. XLVII No. 312</span>
      <span>Saturday, November 14, 2026</span>
      <span>National & International Edition • Price: ₹5.00</span>
    </div>

    <main>
      <h2 class="headline-main">Microsoft's two-day outage knocks out Copilot, Outlook and Teams, and pulls Claude down with it</h2>
      <div class="subdeck">Millions of offices learned how much daily work now runs through cloud AI assistants, and what happens when they stop.</div>

      <div class="lead-story-grid">
        <div class="left-col">
          <p>
            A Microsoft 365 failure that began on November 12 ran into a second day. Outlook, Teams, SharePoint and Microsoft 365 Copilot were hit worldwide; users could not load Copilot Chat, and Copilot could not reach work email or files. Some regions were still waiting for full recovery on day two.
          </p>
          <p>
            Microsoft said it was "deeply sorry" and called it "a technical issue not related to cyber or AI / agents", traced to an earlier network capacity upgrade. A full report is promised.
          </p>
        </div>

        <div class="right-col">
          <p>
            It spread to other AI tools. On November 13 Claude.ai had a major outage and Claude Code was partly down after Anthropic's Microsoft 365 connector began failing; Downdetector logged about 3,800 reports. The Claude API kept running, and Anthropic reported recovery later.
          </p>
          <div class="callout-box">
            <strong>Why it matters to you:</strong> if your work, your shop or your freelance service depends on one AI or cloud tool, keep offline copies of key files and a second tool you know how to use.
          </div>
        </div>
      </div>

      <div class="sources-line">
        <strong>Sources:</strong> <a href="https://www.cnbc.com" target="_blank">CNBC</a> • <a href="https://www.windowscentral.com" target="_blank">Windows Central</a> • <a href="https://www.washingtonpost.com" target="_blank">Washington Post</a> • <a href="https://abcnews.go.com" target="_blank">ABC News</a> • <a href="https://www.businesstoday.in" target="_blank">Business Today</a> • <a href="https://www.androidauthority.com" target="_blank">Android Authority</a> • <a href="https://cybernews.com" target="_blank">Cybernews</a>
      </div>

      <hr class="section-divider">

      <div class="bottom-grid">
        <div class="grid-story">
          <span class="category-badge">Discovery</span>
          <h4>Autonomous Scientific Foundation Models Advance Molecular Biology</h4>
          <p>
            Global consortia deploy real-time planetary climate simulations and accelerated bench testing using hybrid neural architectures.
          </p>
        </div>

        <div class="grid-story">
          <span class="category-badge">Infrastructure</span>
          <h4>Clean Energy Desalination Grid Activated in Coastal Corridors</h4>
          <p>
            Solar-powered reverse osmosis plants commence operations, providing high-efficiency freshwater distribution while offsetting carbon footprints.
          </p>
        </div>

        <div class="grid-story">
          <span class="category-badge">Space Sciences</span>
          <h4>Lunar Deep-Space Communications Relay Achieves First Orbit</h4>
          <p>
            Orbital laser transmitters establish uninterrupted multi-gigabit links between Earth stations and far-side surface prospectors.
          </p>
        </div>
      </div>
    </main>
  </div>
</body>
</html>"""
    ed.html_content = broadsheet_html
    ed.content_size = len(broadsheet_html.encode('utf-8'))
    db.commit()
    print('[OK] English newspaper edition HTML updated with Microsoft Outage lead story!')

db.close()
