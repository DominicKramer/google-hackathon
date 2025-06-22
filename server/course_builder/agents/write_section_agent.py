import json
from typing import List

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.tools import google_search
from pydantic import BaseModel

from course_builder.agents.util import parse_json_output
from course_builder.database.course_manager import (CourseManager,
                                                    CoursePlaceholderReference)
from course_builder.logger import get_system_logger

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
    input_key = f"week_{week}_section_{section}_instructions"
    output_key = f"week_{week}_section_{section}_content"

    def before_agent_callback(callback_context: CallbackContext):
        logger = get_system_logger()
        logger.info(
            f"Before writing section {week} {section}, input_key={input_key}, and the state is:\n{json.dumps(callback_context.state.to_dict(), indent=2)}"
        )

    def after_agent_callback(callback_context: CallbackContext):
        logger = get_system_logger()

        section_content, raw_output = parse_json_output(
            output_key=output_key,
            callback_context=callback_context,
            output_type=SectionContent,
        )

        if section_content is None:
            section_content = SectionContent(
                section_title="Could not generate section content",
                section_content=raw_output,
                references=[],
            )

        logger.info(
            f"After writing section {week} {section}, input_key={input_key}, raw_output={raw_output}, and the section content is:\n{section_content.model_dump_json(indent=2)}"
        )

        course_manager.update_section(
            section_id=section_id,
            status="DONE",
            title=section_content.section_title,
            content_md=section_content.section_content,
            reading_time_min=reading_time_min,
        )
        course_manager.add_section_references(
            section_id=section_id,
            references=[
                CoursePlaceholderReference(
                    url=reference.url,
                    title=reference.title,
                )
                for reference in section_content.references
            ],
        )

    return Agent(
        name=f"section_writer_week_{week}_section_{section}",
        model=MODEL_NAME,
        instruction=f"""
You are an expert at writing technical content.  Your job is to write
the content for week {week} section {section} of the course overview
as specified in {{{input_key}?}}.

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
        before_agent_callback=before_agent_callback,
    )
