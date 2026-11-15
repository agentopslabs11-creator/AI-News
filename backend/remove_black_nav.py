import os
import re
from dotenv import load_dotenv

load_dotenv('e:/AI News/backend/.env')
from app.core.database import SessionLocal
from app.models.newspaper import NewspaperEdition

db = SessionLocal()
editions = db.query(NewspaperEdition).all()
updated = 0

for ed in editions:
    if not ed.html_content:
        continue
    content = ed.html_content
    original_len = len(content)
    
    # 1. Remove nav index tag
    new_content = re.sub(r'<nav[^>]*class=[\'"][^\'"]*index[^\'"]*[\'"][^>]*>.*?</nav>', '', content, flags=re.DOTALL | re.IGNORECASE)
    new_content = re.sub(r'<nav[^>]*aria-label=[\'"]Pages[\'"][^>]*>.*?</nav>', '', new_content, flags=re.DOTALL | re.IGNORECASE)
    
    # 2. Add safety CSS hide rule
    if "</style>" in new_content:
        new_content = new_content.replace(
            "</style>", 
            "\n.index, nav.index, nav[aria-label=\"Pages\"], .wrap > a.brand { display: none !important; }\n</style>"
        )
    
    if new_content != content:
        ed.html_content = new_content
        ed.content_size = len(new_content.encode('utf-8'))
        updated += 1
        print(f"Removed black bar from Edition {ed.id} ({ed.language}) - len diff: {original_len - len(new_content)}")

if updated > 0:
    db.commit()
    print(f"[OK] Successfully committed changes to {updated} edition(s) in Neon PostgreSQL.")
else:
    print("No editions had the black bar.")

db.close()
