from dotenv import dotenv_values
import asyncio
from typing import Dict, List, TypedDict

from celery import Celery

DOT_ENV_VALUES = dotenv_values()
CELERY_BROKER_URL = DOT_ENV_VALUES["CELERY_BROKER_URL"]
CELERY_RESULT_BACKEND = DOT_ENV_VALUES["CELERY_RESULT_BACKEND"]

celery = Celery(__name__)
celery.conf.update(
    broker_url=CELERY_BROKER_URL,
    result_backend=CELERY_RESULT_BACKEND,
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


async def _create_course_impl(course_input: NewCourseInput, user_id: str) -> None:
    pass


@celery.task(bind=True, name="create_course")
def create_course(course_input: NewCourseInput, user_id: str) -> None:
    asyncio.run(_create_course_impl(course_input, user_id))
