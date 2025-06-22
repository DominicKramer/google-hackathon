from typing import List, Dict
from google.adk.agents import SequentialAgent, ParallelAgent
from course_builder.database.course_manager import CourseManager
from course_builder.agents.write_course_overview_agent import (
    create_write_course_overview_agent,
)
from course_builder.agents.write_section_agent import create_write_section_agent


class IdManager:
    def __init__(
        self,
        placeholder_course_id: str,
        placeholder_week_ids: List[str],
        # maps week_id to list of section_ids in that week
        placeholder_week_sections: Dict[str, List[str]],
    ):
        self.placeholder_course_id = placeholder_course_id
        self.placeholder_week_ids = placeholder_week_ids
        self.placeholder_week_sections = placeholder_week_sections

    def get_course_id(self) -> str:
        return self.placeholder_course_id

    def get_week_id(self, week_index: int) -> str:
        return self.placeholder_week_ids[week_index]

    def get_section_id(self, week_index: int, section_index: int) -> str:
        week_id = self.placeholder_week_ids[week_index]
        section_ids = self.placeholder_week_sections[week_id]
        return section_ids[section_index]


def create_write_course_agent(
    course_id: str,
    user_num_weeks: int,
    num_sections_per_week: int,
    reading_time_min: int,
    placeholder_course_id: str,
    placeholder_week_ids: List[str],
    # maps week_id to list of section_ids in that week
    placeholder_week_sections: Dict[str, List[str]],
    course_manager: CourseManager,
):
    id_manager = IdManager(
        placeholder_course_id=placeholder_course_id,
        placeholder_week_ids=placeholder_week_ids,
        placeholder_week_sections=placeholder_week_sections,
    )

    write_course_overview_agent = create_write_course_overview_agent(
        course_id=course_id,
        course_manager=course_manager,
    )

    write_all_sections_agent = ParallelAgent(
        name="write_all_section_agent",
        sub_agents=[
            create_write_section_agent(
                week=week,
                section=section,
                reading_time_min=reading_time_min,
                section_id=id_manager.get_section_id(week, section),
                course_manager=course_manager,
            )
            for week in range(user_num_weeks)
            for section in range(num_sections_per_week)
        ],
    )

    return SequentialAgent(
        name="root_agent",
        sub_agents=[
            write_course_overview_agent,
            write_all_sections_agent,
        ],
    )
