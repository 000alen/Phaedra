import requests
from Phaedra.Notebook import Notebook

notebook = Notebook.from_json("./notebooks/dreamy_rubin.json")
notebook_json = notebook.json()
page_json = notebook.pages[0].json()
cell_json = notebook.pages[0].cells[0].json()

url = "http://127.0.0.1:5000"
requests_info = {
    "/notebook/open": {"method": "POST", "data": {"path": "./notebooks/nice_blackburn.json"}},
    "/notebook/new/from_pdf": {"method": "POST", "data": {"path": "./bitcoin.pdf"}},
    "/notebook/new/from_text": {"method": "POST", "data": {"text": open("./ethereum.txt").read()}},  
    "/entities": {"method": "POST", "data": {
        "notebook": notebook_json,
        "page_index": 0
    }},
    "/question": {"method": "POST", "data": {
        "notebook": notebook_json,
        "page_index": 0,
        "question": "What is ethereum?"
    }},
    "/question/sparse": {"method": "POST", "data": {
        "notebook": notebook_json,
        "question": "What is ethereum?"
    }},
        "/page/new": {"method": "POST", "data": {
        "id": 1, 
        "cells": [{"id": 1, "content": "Hola, mundo!", "data": {}}],
        "data": {}
    }},    
    "/page/remove": {"method": "POST", "data": {
        "notebook": notebook_json,
        "page": page_json
    }},
        "/cell/new": {"method": "POST", "data": {"content": "Hola, mundo!", "data": {}, "id": 1}},
    "/cell/add": {"method": "POST", "data": {
        "notebook": notebook_json,
        "page_index": 0,
        "cell": cell_json
    }},
    "/cell/get": {"method": "POST", "data": {
        "notebook": notebook_json,
        "page_index": 0,
        "cell_index": 0
    }},
    "/cell/remove" :{"method": "POST", "data": {
        "notebook": notebook_json,
        "page_index": 0,
        "cell": cell_json
    }},    
    "/cell/add/question": {"method": "POST", "data": {
        "notebook": notebook_json,
        "page_index": 0,
        "question": "Why is ethereum better than bitcoin?"
    }},
    "/cell/add/wikipedia": {"method": "POST", "data": {
        "notebook": notebook_json,
        "page_index": 0,
        "query": "Chile"
    }},
    "/kill": {"method": "GET"}
}

for route, info in requests_info.items():    
    response = (
        requests.get(url + route) 
        if info["method"] == "GET" 
        else requests.post(url + route, json=info["data"])
    )

    print(str(response.text)[:20])
