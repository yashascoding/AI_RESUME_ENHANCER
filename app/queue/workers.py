import os
from ..db.collections.files import files_collection
from bson import ObjectId
from pdf2image import convert_from_path
from groq import Groq
import base64
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')


async def process_file(id:str,file_path:str):
    await files_collection.update_one({"_id":ObjectId(id)},{
        "$set":{
            "status":"processing"
        }
    })

    #step1 converting pdf to image for better parsing 
    pages=convert_from_path(file_path)
    images=[]

    for i,page in enumerate(pages):
        image_save_path=f"uploads/images/{id}/image{i}.jpg"
        os.makedirs(os.path.dirname(image_save_path), exist_ok=True)
        page.save(image_save_path,'JPEG')
        images.append(image_save_path)


    await files_collection.update_one({"_id":ObjectId(id)},{
    "$set":{
        "status":"converting to images success"
    }
    })

    images_base64=[encode_image(img) for img in images ]

    result = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Based on the resume below roast the resume"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{images_base64[0]}",
                    },
                },
            ],
        }
    ],
    model="qwen/qwen3.6-27b",
)

    response=result.choices[0].message.content

    await files_collection.update_one({"_id":ObjectId(id)},{
        "$set":{
            "status":"processed",
            "result":response
        }
    })