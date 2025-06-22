from google.adk.agents import Agent
from google.adk.tools import google_search
from google.adk.agents.callback_context import CallbackContext
from course_builder.database.course_manager import CourseManager
from course_builder.agents.util import parse_json_output
from pydantic import BaseModel
from typing import List

from dotenv import load_dotenv

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
    course_manager: CourseManager,
):
    output_key = "course_outline"

    def after_agent_callback(callback_context: CallbackContext):
        course_overview = parse_json_output(
            output_key=output_key,
            callback_context=callback_context,
            output_type=CourseOverview,
        )
        course_manager.update_course(
            course_id=course_id,
            status="DONE",
            title=course_overview.course_title,
            description=course_overview.course_description,
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
* For each week:
  * The week's title
  * A one paragraph description of the week's content
  * The learning objectives for the week
  * For each section in the week:
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
