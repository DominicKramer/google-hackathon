import os
import sys
from typing import Any, Awaitable, Callable, cast

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from pydantic import BaseModel

from course_builder.api.worker import NewCourseInput, create_course
from course_builder.database.course_manager import CourseManager
from course_builder.logger import get_system_logger

load_dotenv()
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_JWT_ALGORITHM = os.getenv("SUPABASE_JWT_ALGORITHM")
SUPABASE_JWT_AUDIENCE = os.getenv("SUPABASE_JWT_AUDIENCE")

# Get the system logger
logger = get_system_logger()

app = FastAPI()


@app.middleware("http")
async def authenticate_request(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
):
    assert SUPABASE_JWT_SECRET is not None
    assert SUPABASE_JWT_ALGORITHM is not None
    assert SUPABASE_JWT_AUDIENCE is not None

    # List of paths that don't require authentication
    public_paths = []

    if request.url.path in public_paths:
        return await call_next(request)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    token = auth_header.split("Bearer ")[1]
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[SUPABASE_JWT_ALGORITHM],
            audience=SUPABASE_JWT_AUDIENCE,
        )
        request.state.user = payload.get("sub")
    except JWTError as e:
        print(e)
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})

    response = await call_next(request)
    return response


class CreateCourseResponse(BaseModel):
    course_id: str


class CreateCourseRequest(BaseModel):
    description: str
    expectedResult: str
    experienceLevel: str
    minPerDay: int
    weeks: int


@app.post("/api/v1/create-course", response_model=CreateCourseResponse)
async def api_create_course(
    input: CreateCourseRequest, request: Request
) -> CreateCourseResponse:
    user_id = request.state.user
    logger.info(f"Received create course request for user_id: {user_id}")

    course_manager = CourseManager(user_id=user_id)
    placeholder_ids = await course_manager.add_course_placeholder(
        user_description=input.description,
        user_expected_result=input.expectedResult,
        user_experience_level=input.experienceLevel,
        user_min_per_day=input.minPerDay,
        user_num_weeks=input.weeks,
        user_num_days_per_week=5,
    )

    course_input = NewCourseInput(
        user_description=input.description,
        user_expected_result=input.expectedResult,
        user_experience_level=input.experienceLevel,
        user_min_per_day=input.minPerDay,
        user_num_weeks=input.weeks,
        placeholder_course_id=placeholder_ids.course_id,
        placeholder_week_ids=placeholder_ids.week_ids,
        placeholder_week_sections=placeholder_ids.week_sections,
    )

    logger.info(
        f"Queueing create_course task for user_id: {user_id}, course_id: {placeholder_ids.course_id}"
    )
    cast(Any, create_course).delay(course_input, user_id)
    logger.info(f"Successfully queued create_course task for user_id: {user_id}")

    return CreateCourseResponse(course_id=placeholder_ids.course_id)


def main(dev_mode: bool = False):
    if dev_mode:
        uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main(dev_mode="--dev" in sys.argv)
