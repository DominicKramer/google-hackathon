from typing import Dict, List

from google.adk.agents import ParallelAgent, SequentialAgent

from course_builder.agents.id_manager import IdManager
from course_builder.agents.write_course_overview_agent import \
    create_write_course_overview_agent
from course_builder.agents.write_section_agent import \
    create_write_section_agent
from course_builder.database.course_manager import CourseManager


def create_write_course_agent(
    course_id: str,
    user_description: str,
    user_expected_result: str,  # i.e. become an expert/become conversational
    user_experience_level: str,  # i.e. beginner, intermediate, advanced
    user_min_per_day: int,
    user_num_weeks: int,
    num_sections_per_week: int,
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
        id_manager=id_manager,
        user_description=user_description,
        user_expected_result=user_expected_result,
        user_experience_level=user_experience_level,
        user_min_per_day=user_min_per_day,
    )

    write_all_sections_agent = ParallelAgent(
        name="write_all_section_agent",
        sub_agents=[
            create_write_section_agent(
                week=week,
                section=section,
                reading_time_min=user_min_per_day,
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
