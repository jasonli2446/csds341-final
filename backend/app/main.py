from fastapi import FastAPI

from app.routers import auth, bookings, rides, vehicles

app = FastAPI(title="Campus Carpool API", version="1.0.0")

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(rides.router)
app.include_router(bookings.router)


@app.get("/")
def root():
    return {"message": "Carpool API running"}
