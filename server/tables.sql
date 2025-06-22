create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create type status as enum ('RUNNING', 'DONE');

create table if not exists public.courses (
    id                       uuid primary key default gen_random_uuid(),
    owner_id                 uuid not null references auth.users(id) on delete cascade,
    status                   status not null default 'RUNNING',
    title                    text,
    description              text,
    user_description         text,
    user_expected_result     text,
    user_experience_level    text,
    user_min_per_day         int not null default 0,
    user_num_weeks           int not null default 0,
    created_at               timestamptz not null default now()
);

create table if not exists public.weeks (
    id                      uuid primary key default gen_random_uuid(),
    status                  status not null default 'RUNNING',
    course_id               uuid not null references public.courses(id) on delete cascade,
    title                   text,
    description             text,
    learning_objectives     text[] not null default array[]::text[],
    order_index             int not null,
    created_at              timestamptz not null default now()
);

create table if not exists public.sections (
    id                      uuid primary key default gen_random_uuid(),
    status                  status not null default 'RUNNING',
    course_id               uuid not null references public.courses(id) on delete cascade,
    week_id                 uuid not null references public.weeks(id) on delete cascade,
    title                   text,
    description             text,
    content_md              text,
    reading_time_min        int not null default 0,
    previous_section_id     uuid references public.sections(id),
    next_section_id         uuid references public.sections(id),
    order_index             int not null,
    created_at              timestamptz not null default now()
);

create table if not exists public.references (
    id                      uuid primary key default gen_random_uuid(),
    section_id              uuid not null references public.sections(id) on delete cascade,
    url                     text not null,
    title                   text,
    order_index             int not null,
    created_at              timestamptz not null default now()
);

alter table public.courses      enable row level security;
alter table public.weeks        enable row level security;
alter table public.sections     enable row level security;
alter table public.references   enable row level security;

drop policy if exists "courses_owner_crud" on public.courses;
drop policy if exists "weeks_same_owner" on public.weeks;
drop policy if exists "sections_same_owner" on public.sections;
drop policy if exists "references_same_owner" on public.references;

create policy "courses_owner_crud" on public.courses
    for all
    using    (owner_id = auth.uid())
    with check (owner_id = auth.uid());

create policy "sections_same_owner" on public.sections
    for all
    using (
        exists (
            select 1 from public.courses c
            where c.id = course_id
            and c.owner_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.courses c
            where c.id = course_id
            and c.owner_id = auth.uid()
        )
    );

create policy "weeks_same_owner" on public.weeks
    for all
    using (
        exists (
            select 1 from public.courses c
            where c.id = course_id
                and c.owner_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.courses c
            where c.id = course_id
                and c.owner_id = auth.uid()
        )
    );

create policy "references_same_owner" on public.references
    for all
    using (
        exists (
            select 1 from public.sections s
            where s.id = section_id
                and s.course_id in (
                    select id from public.courses where owner_id = auth.uid()
                )
        )
    )
    with check (
        exists (
            select 1 from public.sections s
            where s.id = section_id
                and s.course_id in (
                    select id from public.courses where owner_id = auth.uid()
                )
        )
    );

/*
The _weeks input is expected to be in the following format:
[
  {
    "title": "Week 1",
    "description": "Introduction",
    "learning_objectives": ["Objective 1", "Objective 2"],
    "sections": [
      {
        "title": "Section 1",
        "description": "First section",
        "content_md": "Markdown content",
        "reading_time_min": 15,
        "references": [
          {"url": "https://example.com", "title": "Reference 1"},
          {"url": "https://example2.com", "title": "Reference 2"}
        ]
      }
    ]
  },
  ...
]

The return value has the following format:
{
  "course_id": "uuid-of-course",
  "week_ids": ["week-uuid-1", "week-uuid-2", "week-uuid-3"],
  "week_sections": {
    "week-uuid-1": ["section-uuid-1", "section-uuid-2"],
    "week-uuid-2": ["section-uuid-3", "section-uuid-4"],
    "week-uuid-3": ["section-uuid-5"]
  }
}
*/

create or replace function public.create_course(
    _title                    text,
    _description              text,
    _weeks                    jsonb,            -- array[ {title, description, learning_objectives, sections: [{title, description, reading_time_min, content_md, references: [{url, title}]}]} … ]
    _user_id                  uuid,             -- The user ID to use for ownership
    _user_description         text default null,
    _user_expected_result     text default null,
    _user_experience_level    text default null,
    _user_min_per_day         int default 0,
    _user_num_weeks               int default 0
)
returns jsonb
language plpgsql
security invoker                     -- keep RLS checks!
as $$
declare
    _course_id     uuid := gen_random_uuid();
    _week_id       uuid;
    _section_id    uuid;
    _prev_section_id uuid := null;
    _week          jsonb;
    _section       jsonb;
    _reference     jsonb;
    _week_i        int := 0;    -- Week order index counter
    _section_i     int := 0;    -- Section order index counter (global across all weeks)
    _ref_i         int := 0;    -- Reference order index counter
    _week_ids      uuid[] := array[]::uuid[];  -- Array to store week IDs in order
    _week_sections jsonb := '{}'::jsonb;       -- JSON object to store week_id -> section_ids mapping
    _section_ids   uuid[];                     -- Array to store section IDs for current week
begin
    -- 1. insert the course owned by the current user
    insert into public.courses(
        id, owner_id, title, description, 
        user_description, user_expected_result, user_experience_level,
        user_min_per_day, user_num_weeks
    )
    values (
        _course_id, _user_id, _title, _description,
        _user_description, _user_expected_result, _user_experience_level,
        _user_min_per_day, _user_num_weeks
    );

    -- 2. iterate over each week
    for _week in
        select value
        from jsonb_array_elements(_weeks) as t(value)
    loop
        _week_id := gen_random_uuid();
        _section_ids := array[]::uuid[];  -- Reset section IDs for this week
        
        -- Add week ID to the ordered array
        _week_ids := array_append(_week_ids, _week_id);
        
        -- Create the week
        insert into public.weeks(
            id, course_id, title, description, learning_objectives, order_index
        )
        values (
            _week_id,
            _course_id,
            _week->>'title',
            _week->>'description',
            coalesce(
                array(
                    select jsonb_array_elements_text(_week->'learning_objectives')
                ),
                array[]::text[]
            ),
            _week_i
        );

        -- 3. iterate over each section in this week
        for _section in
            select value
            from jsonb_array_elements(_week->'sections') as t(value)
        loop
            _section_id := gen_random_uuid();
            
            -- Add section ID to the current week's section array
            _section_ids := array_append(_section_ids, _section_id);

            insert into public.sections(
                id, course_id, week_id, title, description, content_md, reading_time_min,
                previous_section_id, order_index
            )
            values (
                _section_id,
                _course_id,
                _week_id,
                _section->>'title',
                _section->>'description',
                _section->>'content_md',
                coalesce( (_section->>'reading_time_min')::int, 0 ),
                _prev_section_id,
                _section_i
            );

            -- wire the doubly‑linked list
            if _prev_section_id is not null then
                update public.sections
                    set next_section_id = _section_id
                where id = _prev_section_id;
            end if;

            -- 4. iterate over each reference in this section
            if _section->'references' is not null then
                _ref_i := 0;  -- Reset reference counter for each section
                for _reference in
                    select value
                    from jsonb_array_elements(_section->'references') as t(value)
                loop
                    insert into public.references(
                        id, section_id, url, title, order_index
                    )
                    values (
                        gen_random_uuid(),
                        _section_id,
                        _reference->>'url',
                        _reference->>'title',
                        _ref_i
                    );
                    
                    _ref_i := _ref_i + 1;
                end loop;
            end if;

            _prev_section_id := _section_id;
            _section_i := _section_i + 1;    -- Increment the global section order index counter
        end loop;
        
        -- Store the section IDs for this week
        _week_sections := _week_sections || jsonb_build_object(_week_id::text, _section_ids);

        _week_i := _week_i + 1;    -- Increment the week order index counter
    end loop;

    -- Return structured data with course ID, week IDs, and section IDs per week
    return jsonb_build_object(
        'course_id', _course_id,
        'week_ids', _week_ids,
        'week_sections', _week_sections
    );
end;
$$;
