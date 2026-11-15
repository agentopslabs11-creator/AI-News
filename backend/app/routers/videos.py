from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.dependencies.authentication import get_current_admin
from app.models.admin import Admin
from app.models.video import Video
from app.schemas.video import VideoCreate, VideoUpdate, VideoResponse, extract_youtube_id
from app.services.auth_service import log_admin_activity

router = APIRouter(prefix="/admin/videos", tags=["Admin Videos"])

@router.post("", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def create_video(
    vid_in: VideoCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Adds a validated YouTube video news entry."""
    youtube_id = extract_youtube_id(vid_in.youtube_url)
    if not youtube_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube link. Please provide a valid YouTube watch or share URL."
        )

    thumbnail = f"https://img.youtube.com/vi/{youtube_id}/hqdefault.jpg"

    video = Video(
        title=vid_in.title,
        description=vid_in.description,
        youtube_url=vid_in.youtube_url,
        youtube_video_id=youtube_id,
        thumbnail_url=thumbnail,
        language=vid_in.language,
        status=vid_in.status
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="CREATE_VIDEO",
        entity_type="video",
        entity_id=str(video.id),
        details=f"Added YouTube video '{video.title}' ({youtube_id})"
    )

    return video

@router.get("", response_model=List[VideoResponse])
async def list_admin_videos(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    status: Optional[str] = Query(None, pattern="^(draft|published)$"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Lists all videos for administrative management."""
    query = db.query(Video)
    if language:
        query = query.filter(Video.language == language)
    if status:
        query = query.filter(Video.status == status)

    return query.order_by(desc(Video.created_at)).all()

@router.put("/{video_id}", response_model=VideoResponse)
async def update_video(
    video_id: int,
    vid_in: VideoUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Updates a video entry."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found.")

    if vid_in.youtube_url:
        youtube_id = extract_youtube_id(vid_in.youtube_url)
        if not youtube_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid YouTube URL.")
        video.youtube_url = vid_in.youtube_url
        video.youtube_video_id = youtube_id
        video.thumbnail_url = f"https://img.youtube.com/vi/{youtube_id}/hqdefault.jpg"

    if vid_in.title is not None:
        video.title = vid_in.title
    if vid_in.description is not None:
        video.description = vid_in.description
    if vid_in.language is not None:
        video.language = vid_in.language
    if vid_in.status is not None:
        video.status = vid_in.status

    db.commit()
    db.refresh(video)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="UPDATE_VIDEO",
        entity_type="video",
        entity_id=str(video.id),
        details=f"Updated video {video.id} ('{video.title}')"
    )

    return video

@router.delete("/{video_id}")
async def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Deletes a video entry."""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found.")

    title = video.title
    db.delete(video)
    db.commit()

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="DELETE_VIDEO",
        entity_type="video",
        entity_id=str(video_id),
        details=f"Deleted video {video_id}: '{title}'"
    )

    return {"message": f"Video '{title}' deleted successfully."}
