from fastapi import FastAPI
from database import get_connection

app = FastAPI()

@app.get("/")
def root():
    return {"message": "User Service Running"}

@app.get("/users")
def get_users():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users")
    users = cur.fetchall()

    cur.close()
    conn.close()

    return users
