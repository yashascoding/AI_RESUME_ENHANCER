from typing import TypedDict, Optional
from .. import database
from pymongo.asynchronous.collection import AsyncCollection

class AnalysisSchema(TypedDict):
    user_id: str
    resume_text: str
    job_description: str
    result: dict
    created_at: str

COLLECTION_NAME = "analyses"
analyses_collection: AsyncCollection = database[COLLECTION_NAME]
