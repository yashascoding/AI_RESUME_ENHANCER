from typing import TypedDict,Optional
from pydantic import Field 
from .. import database
from pymongo.asynchronous.collection import AsyncCollection

class FileSchema(TypedDict):
    name:str=Field(...,description="Name of the file")
    status: str=Field(...,description="This is the status of the file")
    result:Optional[str]=Field(None,description="The result from AI")

COLLECTION_NAME="files"
files_collection: AsyncCollection=database[COLLECTION_NAME]
