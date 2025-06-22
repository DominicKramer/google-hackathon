import asyncio
from typing import Dict, List, TypedDict

from celery import Celery
from dotenv import dotenv_values

from course_builder.capabilities.create_course import CreateCourseInput
from course_builder.capabilities.create_course import \
    create_course as create_course_impl

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


@celery.task(bind=False, name="create_course")
def create_course(course_input: NewCourseInput, user_id: str) -> None:
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
