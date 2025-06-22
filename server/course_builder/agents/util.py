from typing import Type, TypeVar

from pydantic import BaseModel

from google.adk.agents.callback_context import CallbackContext

T = TypeVar("T", bound=BaseModel)


def parse_json_output(
    output_key: str, callback_context: CallbackContext, output_type: Type[T]
) -> T:
    raw_output: str = callback_context.state[output_key]

    if raw_output.startswith("```json"):
        raw_output = raw_output[7:]

    if raw_output.endswith("```"):
        raw_output = raw_output[:-3]

    return output_type.model_validate_json(raw_output)
