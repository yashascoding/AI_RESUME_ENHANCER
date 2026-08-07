from fastapi import FastAPI,UploadFile,Path
from uuid import uuid4
from .utils.file import save_to_disk
from .db.collections.files import files_collection,FileSchema
from .queue.workers import process_file
from .queue.q import q
from bson import ObjectId


app=FastAPI()

@app.get("/")
def hello():
    return{"status":"Healthy"}


@app.get("/{id}")
async def get_file_by_id(id:str=Path(...,description="ID of the file")):
    db_file=await files_collection.find_one({"_id":ObjectId(id)})
    if not db_file:
        return {"error":"File not found"}
    return {
        "_id":str(db_file["_id"]),
        "name":db_file["name"],
        "status":db_file["status"],
        "result":db_file["result"] if "result" in db_file else None,
        }


@app.post("/upload")
async def upload_file(file:UploadFile):
    file_id = str(uuid4())

    db_file = await files_collection.insert_one(
        document=FileSchema(
            name=file.filename,
            status="saving"
        )
    )

    file_path = f"uploads/{file_id}/{file.filename}"
    await save_to_disk(file=await file.read(), path=file_path)

    q.enqueue(process_file,str(db_file.inserted_id),file_path)

    await files_collection.update_one({"_id": db_file.inserted_id}, {
        "$set": {
            "status": "queued"
        }
    })

    return {"file id": str(db_file.inserted_id)}