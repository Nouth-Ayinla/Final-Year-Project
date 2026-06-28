from fastapi import FastAPI, HTTPException

app = FastAPI()

items = []

@app.get("/")
def root():
    return ("Hello world")

@app.post("/items")
def create_item(item: str):
    items.append(item)
    return items

@app.get("/items")
def get_item(limit: int = 10):
    return items[0:limit]

@app.get("/items/{item_id}")
def get_item(item_id: int) -> str:
    if item_id > len(items) - 1:  #@audit right here we checked the len(items) and reduced it by 1 

        #@audit right here we checked properly 
        raise HTTPException(status_code=404, detail="Item not found!!!")
    
    item = items[item_id] #@audit then we position it right here and pushed the value out from here 
    return item