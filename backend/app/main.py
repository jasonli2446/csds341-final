from fastapi import FastAPI

app = FastAPI(title="Campus Carpool API", version="1.0.0")


@app.get("/")
def root():
    return {"message": "Carpool API running"}
