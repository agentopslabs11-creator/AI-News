import os
from dotenv import load_dotenv
load_dotenv('e:/AI News/backend/.env')
from app.core.database import SessionLocal
from app.models.newspaper import NewspaperEdition

db = SessionLocal()
target_link = "https://chat.whatsapp.com/EfN85yaYDu6BKlK409qXbA"

editions = db.query(NewspaperEdition).all()
updated = 0
for ed in editions:
    if ed.html_content and "whatsapp" in ed.html_content.lower():
        content = ed.html_content
        import re
        # Find any whatsapp links and make sure they match target_link
        new_content = re.sub(r'href=[\'"][^\'"]*whatsapp\.com[^\'"]*[\'"]', f'href="{target_link}" target="_blank" rel="noopener noreferrer"', content)
        if new_content != content:
            ed.html_content = new_content
            ed.content_size = len(new_content.encode('utf-8'))
            updated += 1
            print(f"Updated WhatsApp link in edition {ed.id} ({ed.language})")

if updated > 0:
    db.commit()
    print(f"Committed {updated} editions with verified WhatsApp link: {target_link}")
else:
    print("All WhatsApp links in database were already up to date.")

db.close()
