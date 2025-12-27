from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from database import reviews_collection
from bson import ObjectId

app = FastAPI()


class Review(BaseModel):
    product_id: int = Field(..., example=1)
    review: str = Field(..., example="Barang bagus, pengiriman cepat")
    rating: int = Field(..., ge=1, le=5, example=5)


@app.post("/review")
def create_review(review: Review):
    try:
        # Convert Pydantic → dict
        review_dict = review.model_dump()

        # Insert ke Mongo
        result = reviews_collection.insert_one(review_dict)

        # FIX UTAMA: ObjectId → string
        review_dict["_id"] = str(result.inserted_id)

        return {
            "success": True,
            "message": "Review created successfully",
            "data": review_dict
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/reviews")
def get_reviews():
    try:
        reviews = []
        for r in reviews_collection.find():
            r["_id"] = str(r["_id"])  # FIX ObjectId
            reviews.append(r)

        return {
            "success": True,
            "data": reviews
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reviews/{product_id}")
def get_reviews_by_product(product_id: int):
    try:
        reviews = []
        for r in reviews_collection.find({"product_id": product_id}):
            r["_id"] = str(r["_id"])  # FIX ObjectId
            reviews.append(r)

        return {
            "success": True,
            "data": reviews
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.delete("/review/{review_id}")
def delete_review(review_id: str):
    try:
        result = reviews_collection.delete_one(
            {"_id": ObjectId(review_id)}
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Review tidak ditemukan"
            )

        return {
            "success": True,
            "message": "Review berhasil dihapus"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    
