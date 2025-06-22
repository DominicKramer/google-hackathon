from typing import Type, TypeVar

from pydantic import BaseModel
from typing import Tuple

from google.adk.agents.callback_context import CallbackContext
from course_builder.logger import get_system_logger

T = TypeVar("T", bound=BaseModel)


def parse_json_output(
    output_key: str, callback_context: CallbackContext, output_type: Type[T]
) -> Tuple[T | None, str]:
    raw_output: str = callback_context.state[output_key]
    get_system_logger().info(
        f"Parsing JSON output for output_key={output_key}\nraw_output:\n{raw_output}"
    )

    if raw_output.startswith("```json"):
        raw_output = raw_output[7:]

    if raw_output.endswith("```"):
        raw_output = raw_output[:-3]

    try:
        return output_type.model_validate_json(raw_output), raw_output
    except Exception as e:
        get_system_logger().error(
            f"Error parsing JSON output for output_key={output_key}\nraw_output:\n{raw_output}\nerror:\n{e}\n"
        )
        return None, raw_output
