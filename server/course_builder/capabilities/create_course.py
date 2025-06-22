from typing import Dict, List

from pydantic import BaseModel

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from course_builder.database.course_manager import CourseManager
from course_builder.agents.write_course_agent import create_write_course_agent


class CreateCourseInput(BaseModel):
    user_description: str
    user_expected_result: str  # i.e. become an expert/become conversational
    user_experience_level: str  # i.e. beginner, intermediate, advanced
    user_min_per_day: int
    user_num_weeks: int
    placeholder_course_id: str
    placeholder_week_ids: List[str]
    # maps week_id to list of section_ids in that week
    placeholder_week_sections: Dict[str, List[str]]


APP_NAME = "course-builder"
USER_ID = "user-1"
SESSION_ID = "session-1"


async def create_course(course_input: CreateCourseInput, user_id: str) -> str | None:
    print("Creating course...")
    course_manager = CourseManager(user_id=user_id)
    write_course_agent = create_write_course_agent(
        course_id=course_input.placeholder_course_id,
        user_num_weeks=course_input.user_num_weeks,
        num_sections_per_week=5,
        reading_time_min=course_input.user_min_per_day,
        placeholder_course_id=course_input.placeholder_course_id,
        placeholder_week_ids=course_input.placeholder_week_ids,
        placeholder_week_sections=course_input.placeholder_week_sections,
        course_manager=course_manager,
    )

    session_service = InMemorySessionService()
    session_service.create_session(
        app_name=APP_NAME, user_id=USER_ID, session_id=SESSION_ID
    )
    runner = Runner(
        agent=write_course_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    initial_message = f"""
<topic-and-user-description-of-what-the-user-wants-to-learn>
{course_input.user_description}
</topic-and-user-description-of-what-the-user-wants-to-learn>

<user-experience-level>
{course_input.user_experience_level}
</user-experience-level>

<user-expected-result>
{course_input.user_expected_result}
</user-expected-result>

<user-course-length-in-weeks>
{course_input.user_num_weeks}
</user-course-length-in-weeks>

<user-min-per-day-to-spend-on-course>
{course_input.user_min_per_day}
</user-min-per-day-to-spend-on-course>
"""

    user_content = types.Content(role="user", parts=[types.Part(text=initial_message)])

    final_response: str | None = None
    async for event in runner.run_async(
        user_id=USER_ID, session_id=SESSION_ID, new_message=user_content
    ):
        print(f"Event: {event}, Author: {event.author}")
        if event.is_final_response() and event.content and event.content.parts:
            final_response = event.content.parts[0].text

    return final_response
