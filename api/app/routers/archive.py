from datetime import date
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.newspaper import NewspaperEdition

router = APIRouter(prefix="/public/archive", tags=["Archive"])

@router.get("")
async def get_archive_tree(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    year: Optional[int] = Query(None, ge=1990, le=2100),
    db: Session = Depends(get_db)
):
    """
    Returns an organized historical newspaper archive hierarchy:
    Year -> Month -> Day -> Editions (English, Telugu, Hindi).
    Only includes existing, published editions.
    """
    query = db.query(NewspaperEdition).filter(NewspaperEdition.status == "published")
    if language:
        query = query.filter(NewspaperEdition.language == language)
    
    editions = query.order_by(desc(NewspaperEdition.publication_date)).all()

    # Build hierarchical tree:
    # {
    #   "2026": {
    #       "11": {
    #           "month_name": "November",
    #           "days": {
    #               "2026-11-14": [ {edition info}, ... ]
    #           }
    #       }
    #   }
    # }
    archive_tree: Dict[int, Dict[int, Any]] = {}

    month_names = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    for ed in editions:
        y = ed.publication_date.year
        if year and y != year:
            continue
        m = ed.publication_date.month
        d_str = ed.publication_date.isoformat()

        if y not in archive_tree:
            archive_tree[y] = {}
        if m not in archive_tree[y]:
            archive_tree[y][m] = {
                "month_name": month_names[m],
                "month_num": m,
                "days": {}
            }
        if d_str not in archive_tree[y][m]["days"]:
            archive_tree[y][m]["days"][d_str] = {
                "date": d_str,
                "day": ed.publication_date.day,
                "editions": []
            }

        archive_tree[y][m]["days"][d_str]["editions"].append({
            "id": ed.id,
            "title": ed.title,
            "language": ed.language,
            "publication_date": d_str,
            "description": ed.description,
            "content_size": ed.content_size,
            "published_at": ed.published_at.isoformat() if ed.published_at else None
        })

    # Format into ordered list for frontend simplicity
    years_list = []
    for y_key in sorted(archive_tree.keys(), reverse=True):
        months_list = []
        for m_key in sorted(archive_tree[y_key].keys(), reverse=True):
            days_obj = archive_tree[y_key][m_key]["days"]
            days_list = [
                days_obj[d_key]
                for d_key in sorted(days_obj.keys(), reverse=True)
            ]
            months_list.append({
                "month_num": m_key,
                "month_name": archive_tree[y_key][m_key]["month_name"],
                "days": days_list
            })
        years_list.append({
            "year": y_key,
            "months": months_list
        })

    return {
        "total_editions": len(editions),
        "years": years_list
    }
