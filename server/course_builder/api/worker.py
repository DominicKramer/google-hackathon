import asyncio
import os
from typing import Dict, List, TypedDict

from celery import Celery
from dotenv import load_dotenv

from course_builder.capabilities.create_course import CreateCourseInput
from course_builder.capabilities.create_course import (
    create_course as create_course_impl,
)
from course_builder.logger import get_system_logger

load_dotenv()
CELERY_BROKER_URL = os.environ["CELERY_BROKER_URL"]
CELERY_RESULT_BACKEND = os.environ["CELERY_RESULT_BACKEND"]

# Get the system logger
logger = get_system_logger()

celery = Celery(__name__)
celery.conf.update(
    broker_url=CELERY_BROKER_URL,
    result_backend=CELERY_RESULT_BACKEND,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=10 * 60,  # 30 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    worker_disable_rate_limits=False,
    task_always_eager=False,
    task_eager_propagates=True,
    worker_enable_remote_control=False,
    worker_send_task_events=True,
    task_send_sent_event=True,
    task_ignore_result=False,
    task_store_errors_even_if_ignored=True,
    task_annotations={"*": {"rate_limit": "10/m"}},
)


class NewCourseInput(TypedDict):
    user_description: str
    user_expected_result: str  # i.e. become an expert/become conversational
    user_experience_level: str  # i.e. beginner, intermediate, advanced
    user_min_per_day: int
    user_num_weeks: int
    placeholder_course_id: str
    placeholder_week_ids: List[str]
    # maps week_id to list of section_ids in that week
    placeholder_week_sections: Dict[str, List[str]]


@celery.task(bind=False, name="create_course")
def create_course(course_input: NewCourseInput, user_id: str) -> None:
    logger.info(f"Starting create_course task for user_id: {user_id}")
    logger.info(f"Course input: {course_input}")

    try:
        asyncio.run(
            create_course_impl(
                CreateCourseInput(
                    user_description=course_input["user_description"],
                    user_expected_result=course_input["user_expected_result"],
                    user_experience_level=course_input["user_experience_level"],
                    user_min_per_day=course_input["user_min_per_day"],
                    user_num_weeks=course_input["user_num_weeks"],
                    placeholder_course_id=course_input["placeholder_course_id"],
                    placeholder_week_ids=course_input["placeholder_week_ids"],
                    placeholder_week_sections=course_input["placeholder_week_sections"],
                ),
                user_id=user_id,
            )
        )
        logger.info(f"Successfully completed create_course task for user_id: {user_id}")
    except Exception as e:
        logger.error(f"Error in create_course task for user_id {user_id}: {str(e)}")
        raise
