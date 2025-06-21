from typing import Dict, List, Literal
from course_builder.database.util import get_traditional_client
from pydantic import BaseModel

Status = Literal["RUNNING", "DONE"]


class CoursePlaceholderReference(BaseModel):
    url: str
    title: str


class CoursePlaceholderSection(BaseModel):
    title: str
    description: str
    content_md: str
    reading_time_min: int
    references: List[CoursePlaceholderReference]


class CoursePlaceholderWeek(BaseModel):
    title: str
    description: str
    learning_objectives: List[str]
    sections: List[CoursePlaceholderSection]


type CoursePlaceholderInput = List[CoursePlaceholderWeek]


class CoursePlaceholderResult(BaseModel):
    course_id: str
    week_ids: List[str]
    # maps week_id to list of section_ids in that week
    week_sections: Dict[str, List[str]]


class CourseManager:
    def __init__(self, table_name: str, user_id: str):
        self.client = get_traditional_client()
        self.table_name = table_name
        self.user_id = user_id

    async def add_course_placeholder(
        self,
        user_description: str,
        user_expected_result: str,  # i.e. become an expert/become conversational
        user_experience_level: str,  # i.e. beginner, intermediate, advanced
        user_min_per_day: int,
        user_num_weeks: int,
        user_num_days_per_week: int,
    ) -> CoursePlaceholderResult:
        weeks: CoursePlaceholderInput = [
            CoursePlaceholderWeek(
                title="",
                description="",
                learning_objectives=[],
                sections=[
                    CoursePlaceholderSection(
                        title="",
                        description="",
                        content_md="",
                        reading_time_min=0,
                        references=[],
                    )
                    for _ in range(user_num_days_per_week)
                ],
            )
            for _ in range(user_num_weeks)
        ]

        response = self.client.rpc(
            "create_course",
            {
                "_title": "",
                "_description": "",
                "_weeks": weeks,
                "_user_id": self.user_id,
                "_user_description": user_description,
                "_user_expected_result": user_expected_result,
                "_user_experience_level": user_experience_level,
                "_user_min_per_day": user_min_per_day,
                "_user_num_weeks": user_num_weeks,
            },
        ).execute()

        return CoursePlaceholderResult.model_validate(response.data)

    def update_course(
        self,
        course_id: str,
        status: Status,
        title: str,
        description: str,
    ):
        self.client.table(self.table_name).update(
            {
                "status": status,
                "title": title,
                "description": description,
            }
        ).eq("id", course_id).execute()

    def update_week(
        self,
        week_id: str,
        status: Status,
        title: str,
        description: str,
        learning_objectives: List[str],
    ):
        self.client.table(self.table_name).update(
            {
                "status": status,
                "title": title,
                "description": description,
                "learning_objectives": learning_objectives,
            }
        ).eq("id", week_id).execute()

    def update_section(
        self,
        section_id: str,
        status: Status,
        title: str,
        description: str,
        content_md: str,
        reading_time_min: int,
    ):
        self.client.table(self.table_name).update(
            {
                "status": status,
                "title": title,
                "description": description,
                "content_md": content_md,
                "reading_time_min": reading_time_min,
            }
        ).eq("id", section_id).execute()
