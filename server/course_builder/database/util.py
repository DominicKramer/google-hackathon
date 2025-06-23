import os
import urllib.parse

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from supabase import create_client
from supabase.lib.client_options import SyncClientOptions

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_POOLER_URL = os.getenv("SUPABASE_POOLER_URL", "")
SUPABASE_PASSWORD = os.getenv("PG_PW", "")

ENCODED_PASSWORD = urllib.parse.quote_plus(SUPABASE_PASSWORD, safe="")
ENCODED_POOLER_URL = SUPABASE_POOLER_URL.replace("[YOUR-PASSWORD]", ENCODED_PASSWORD)


def create_table_if_not_exists(table_name: str, schema: str, table_sql: str):
    engine = create_engine(ENCODED_POOLER_URL, pool_size=5, max_overflow=2)
    insp = inspect(engine)
    if not insp.has_table(table_name, schema):
        with engine.begin() as conn:
            conn.execute(text(table_sql))


def execute_sql(sql: str):
    engine = create_engine(ENCODED_POOLER_URL, pool_size=5, max_overflow=2)
    with engine.begin() as conn:
        conn.execute(text(sql))


def get_traditional_client():
    assert SUPABASE_URL is not None
    assert SUPABASE_SERVICE_ROLE_KEY is not None

    return create_client(
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_SERVICE_ROLE_KEY,
        options=SyncClientOptions(
            auto_refresh_token=False,
            persist_session=False,
        ),
    )
