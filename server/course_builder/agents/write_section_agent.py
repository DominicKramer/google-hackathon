from google.adk.agents import Agent
from google.adk.tools import google_search
from google.adk.agents.callback_context import CallbackContext
from course_builder.agents.util import parse_json_output
from course_builder.database.course_manager import CourseManager
from pydantic import BaseModel
from typing import List

from dotenv import load_dotenv

load_dotenv()
MODEL_NAME = "gemini-2.5-pro-preview-05-06"


class SectionReference(BaseModel):
    url: str
    title: str


class SectionContent(BaseModel):
    section_title: str
    section_content: str
    references: List[SectionReference]


def create_write_section_agent(
    week: int,
    section: int,
    reading_time_min: int,
    section_id: str,
    course_manager: CourseManager,
):
    output_key = f"week_{week}_section_{section}_content"

    def after_agent_callback(callback_context: CallbackContext):
        section_content = parse_json_output(
            output_key=output_key,
            callback_context=callback_context,
            output_type=SectionContent,
        )
        course_manager.update_section(
            section_id=section_id,
            status="DONE",
            title=section_content.section_title,
            content_md=section_content.section_content,
            reading_time_min=reading_time_min,
        )

    return Agent(
        name=f"section_writer_week_{week}_section_{section}",
        model=MODEL_NAME,
        instruction=f"""
You are an expert at writing technical content.  Your job is to write
the content for week {week} section {section} of the course overview in {{course_outline}}

You MUST use the Google Search Tool to gather all information needed
prior to writing the content.

Your result MUST contain references to all of the sources used and you
MUST write enough content that it takes {reading_time_min}
minutes to read.  You MUST include code examples with explanations.

Your result MUST be in JSON format using the following schema:

{{
    "section_title": "string",
    "section_content": "string",
    "references": [
        {{
            "url": "string",
            "title": "string",
        }},
        ...
    ]
}}
    """,
        output_key=output_key,
        tools=[google_search],
        after_agent_callback=after_agent_callback,
    )
