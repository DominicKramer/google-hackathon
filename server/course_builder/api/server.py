import sys
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from typing import Callable, Awaitable, Any, cast
from pydantic import BaseModel
from dotenv import dotenv_values
from course_builder.api.worker import create_course, NewCourseInput
from course_builder.database.course_manager import CourseManager

DOT_ENV_VALUES = dotenv_values()
SUPABASE_JWT_SECRET = DOT_ENV_VALUES["SUPABASE_JWT_SECRET"]
SUPABASE_JWT_ALGORITHM = DOT_ENV_VALUES["SUPABASE_JWT_ALGORITHM"]
SUPABASE_JWT_AUDIENCE = DOT_ENV_VALUES["SUPABASE_JWT_AUDIENCE"]

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
    course_manager = CourseManager(table_name="courses", user_id=user_id)
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
    cast(Any, create_course).delay(course_input, user_id)
    return CreateCourseResponse(course_id=placeholder_ids.course_id)


def main(dev_mode: bool = False):
    if dev_mode:
        uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main(dev_mode="--dev" in sys.argv)
