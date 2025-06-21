from typing import Dict, List

from pydantic import BaseModel

from course_builder.database.course_manager import CourseManager


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


class IdManager:
    def __init__(self, course_input: CreateCourseInput):
        self.course_input = course_input

    def get_course_id(self) -> str:
        return self.course_input.placeholder_course_id

    def get_week_id(self, week_index: int) -> str:
        return self.course_input.placeholder_week_ids[week_index]

    def get_section_id(self, week_index: int, section_index: int) -> str:
        section_ids = self.course_input.placeholder_week_ids[week_index]
        return section_ids[section_index]


async def create_course(course_input: CreateCourseInput, user_id: str) -> None:
    course_manager = CourseManager(table_name="courses", user_id=user_id)
    id_manager = IdManager(course_input)

    course_manager.update_course(
        course_id=id_manager.get_course_id(),
        status="DONE",
        title="Some course title",
        description="Some course description",
    )

    for week_index in range(course_input.user_num_weeks):
        week_id = id_manager.get_week_id(week_index)
        course_manager.update_week(
            week_id=week_id,
            status="DONE",
            title=f"Some week title: {week_index}",
            description=f"Some week description: {week_index}",
            learning_objectives=[
                f"some objective: {week_index}",
                f"some other objective: {week_index}",
            ],
        )

        for section_index in range(
            len(course_input.placeholder_week_sections[week_id])
        ):
            section_id = id_manager.get_section_id(week_index, section_index)
            course_manager.update_section(
                section_id=section_id,
                status="DONE",
                title=f"Some section title: {week_index}-{section_id}",
                description=f"Some section description: {week_index}-{section_id}",
                content_md=f"Some section content: {week_index}-{section_id}",
                reading_time_min=10,
            )
