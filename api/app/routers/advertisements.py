from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import asc

from app.core.database import get_db
from app.dependencies.authentication import get_current_admin
from app.models.admin import Admin
from app.models.advertisement import Advertisement
from app.schemas.advertisement import (
    AdvertisementCreate,
    AdvertisementUpdate,
    AdvertisementResponse
)
from app.services.auth_service import log_admin_activity

router = APIRouter(tags=["Advertisements"])

@router.get("/public/advertisements")
async def get_public_advertisements(db: Session = Depends(get_db)):
    """Returns active left and right sidebar advertisements for the homepage."""
    ads = db.query(Advertisement).filter(Advertisement.is_active == True).order_by(asc(Advertisement.position)).all()
    
    left_ads = [ad for ad in ads if ad.side == 'left']
    right_ads = [ad for ad in ads if ad.side == 'right']
    
    return {
        "left": left_ads,
        "right": right_ads
    }

@router.get("/admin/advertisements", response_model=List[AdvertisementResponse])
async def list_admin_advertisements(
    side: Optional[str] = Query(None, pattern="^(left|right)$"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Lists all advertisements for administrative management."""
    query = db.query(Advertisement)
    if side:
        query = query.filter(Advertisement.side == side)
    return query.order_by(asc(Advertisement.side), asc(Advertisement.position)).all()

@router.post("/admin/advertisements", response_model=AdvertisementResponse, status_code=status.HTTP_201_CREATED)
async def create_advertisement(
    ad_in: AdvertisementCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Creates a new advertisement slot."""
    ad = Advertisement(
        title=ad_in.title,
        image_url=ad_in.image_url,
        link_url=ad_in.link_url,
        side=ad_in.side,
        position=ad_in.position,
        is_active=ad_in.is_active
    )
    db.add(ad)
    db.commit()
    db.refresh(ad)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="CREATE_ADVERTISEMENT",
        entity_type="advertisement",
        entity_id=str(ad.id),
        details=f"Created {ad.side} advertisement #{ad.position}: '{ad.title}'"
    )

    return ad

@router.put("/admin/advertisements/{ad_id}", response_model=AdvertisementResponse)
async def update_advertisement(
    ad_id: int,
    ad_in: AdvertisementUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Updates an advertisement slot."""
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advertisement not found.")

    update_data = ad_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(ad, field, val)

    db.commit()
    db.refresh(ad)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="UPDATE_ADVERTISEMENT",
        entity_type="advertisement",
        entity_id=str(ad.id),
        details=f"Updated advertisement #{ad.id}"
    )

    return ad

@router.delete("/admin/advertisements/{ad_id}")
async def delete_advertisement(
    ad_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Deletes an advertisement slot."""
    ad = db.query(Advertisement).filter(Advertisement.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advertisement not found.")

    title = ad.title
    db.delete(ad)
    db.commit()

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="DELETE_ADVERTISEMENT",
        entity_type="advertisement",
        entity_id=str(ad_id),
        details=f"Deleted advertisement #{ad_id}: '{title}'"
    )

    return {"message": f"Advertisement '{title}' deleted."}
