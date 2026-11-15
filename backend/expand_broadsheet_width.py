import os
from dotenv import load_dotenv
load_dotenv('e:/AI News/backend/.env')
from app.core.database import SessionLocal
from app.models.newspaper import NewspaperEdition

db = SessionLocal()

editions = db.query(NewspaperEdition).all()
print(f"Found {len(editions)} editions in database.")

updated_count = 0
for ed in editions:
    if ed.html_content:
        content = ed.html_content
        changed = False
        
        # Replace any max-width restrictions on newspaper-container
        if "max-width: 1400px; width: 98%;" in content:
            content = content.replace("max-width: 1400px; width: 98%;", "width: 100%; max-width: 100%;")
            changed = True
        elif "max-width: 1100px;" in content:
            content = content.replace("max-width: 1100px;", "width: 100%; max-width: 100%;")
            changed = True
        elif "max-width: 1000px;" in content:
            content = content.replace("max-width: 1000px;", "width: 100%; max-width: 100%;")
            changed = True
        elif "max-width: 1200px;" in content:
            content = content.replace("max-width: 1200px;", "width: 100%; max-width: 100%;")
            changed = True
        
        # Allow subdeck to expand fully
        if "max-width: 1200px;" in content:
            content = content.replace("max-width: 1200px;", "max-width: 95%;")
            changed = True
        if "max-width: 880px;" in content:
            content = content.replace("max-width: 880px;", "max-width: 95%;")
            changed = True
        if "max-width: 850px;" in content:
            content = content.replace("max-width: 850px;", "max-width: 95%;")
            changed = True

        if changed:
            ed.html_content = content
            ed.content_size = len(content.encode('utf-8'))
            updated_count += 1

if updated_count > 0:
    db.commit()
    print(f"[OK] Successfully updated {updated_count} editions to 100% full-width layout.")
else:
    print("[INFO] No editions needed updating or already 100% width.")

db.close()
