import json
from typing import List

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.tools import google_search
from pydantic import BaseModel

from course_builder.agents.id_manager import IdManager
from course_builder.agents.util import parse_json_output
from course_builder.database.course_manager import CourseManager
from course_builder.logger import get_system_logger

load_dotenv()
MODEL_NAME = "gemini-2.5-pro-preview-05-06"


class SectionOverview(BaseModel):
    section_title: str
    section_instructions: str


class WeekOverview(BaseModel):
    week_title: str
    week_description: str
    learning_objectives: List[str]
    sections: List[SectionOverview]


class CourseOverview(BaseModel):
    course_title: str
    course_description: str
    weeks: List[WeekOverview]


def create_write_course_overview_agent(
    course_id: str,
    user_description: str,
    user_expected_result: str,  # i.e. become an expert/become conversational
    user_experience_level: str,  # i.e. beginner, intermediate, advanced
    user_min_per_day: int,
    course_manager: CourseManager,
    id_manager: IdManager,
):
    output_key = "course_outline"

    def after_agent_callback(callback_context: CallbackContext):
        logger = get_system_logger()

        course_overview, raw_output = parse_json_output(
            output_key=output_key,
            callback_context=callback_context,
            output_type=CourseOverview,
        )

        if course_overview is None:
            course_overview = CourseOverview(
                course_title="Could not generate course overview",
                course_description=raw_output,
                weeks=[],
            )

        logger.info(
            f"After writing the course overview, the raw output is:\n{raw_output}\nAnd the course overview is:\n{course_overview.model_dump_json(indent=2)}"
        )

        delta = {
            f"week_{week_index}_section_{section_index}_instructions": f"""
<user-description-of-what-they-want-to-learn>
{user_description}
</user-description-of-what-they-want-to-learn>

<user-expected-result>
{user_expected_result}
</user-expected-result>

<user-experience-level>
{user_experience_level}
</user-experience-level>

<section-title>
{section.section_title}
</section-title>

<required-reading-time-in-minutes>
{user_min_per_day}
</required-reading-time-in-minutes>

<section-instructions>
{section.section_instructions}
</section-instructions>
"""
            for week_index, week in enumerate(course_overview.weeks)
            for section_index, section in enumerate(week.sections)
        }
        callback_context.state.update(delta)

        logger.info(
            f"After writing the course overview, created the state delta:\n{json.dumps(delta, indent=2)}"
        )
        logger.info(
            f"After writing the course overview and updating the state delta, the status is:\n{json.dumps(callback_context.state.to_dict(), indent=2)}"
        )

        course_manager.update_course(
            course_id=course_id,
            status="DONE",
            title=course_overview.course_title,
            description=course_overview.course_description,
        )

        for week_index, week in enumerate(course_overview.weeks):
            course_manager.update_week(
                week_id=id_manager.get_week_id(week_index),
                status="DONE",
                title=week.week_title,
                description=week.week_description,
                learning_objectives=week.learning_objectives,
            )

    return Agent(
        name="course_overview_writer",
        model=MODEL_NAME,
        instruction="""
You are an expert at designing courses.  Your job is to design a
course given a topic.

You will be given a topic and user description of what the user wants to learn,
their experience level (i.e. beginner, intermediate, advanced), their expected
result (i.e. become an expert, become conversational), the number of weeks they
want the course to last, and the number of minutes each day they can spend on
the course.

Your task is to design the course outline and you MUST use the Google Search
Tool provided to gather all information needed prior to designing the course.

Someone else will use the information in your course outline to write
the actual content for the course.

The course outline MUST contain:
* The course title
* A short one paragraph description of the course
* For each week you MUST write:
  * The week's title
  * A one paragraph description of the week's content
  * The learning objectives for the week
  * For each section in the week you MUST write:
    * The section's title
    * Detailed instructions that will be used by a writer to write the full
      content for the section.  These instructions MUST clearly detail what
      information should be included in the section along with web page
      URL links pointing to where the writer should find the information.

You MUST use the Google Search Tool as much as possible and your result
MUST contain references to all of the sources used.

Your result MUST be in JSON format using the following schema:

{{
    "course_title": "string",
    "course_description": "string",
    "weeks": [
        {{
            "week_title": "string",
            "week_description": "string",
            "learning_objectives": [
                "string",
                ...
            ],
            "sections": [
                {{
                    "section_title": "string",
                    "section_instructions": "string",
                }}
            ]
        }}
    ]
}}
""",
        output_key=output_key,
        tools=[google_search],
        after_agent_callback=after_agent_callback,
    )
