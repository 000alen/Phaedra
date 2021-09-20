import requests

from Phaedra.Notebook import Notebook

# OPEN_PATH = "./notebooks/nice_blackburn.json"
OPEN_PATH = input("OPEN_PATH> ")

# FROM_PDF_PATH = "./bitcoin.pdf"
FROM_PDF_PATH = input("FROM_PDF_PATH> ")

# FROM_TEXT_PATH = "./ethereum.txt"
FROM_TEXT_PATH = input("FROM_TEXT_PATH> ")

# FROM_JSON_PATH = "./notebooks/dreamy_rubin.json"
FROM_JSON_PATH = input("FROM_JSON_PATH> ")

notebook = Notebook.from_json(FROM_JSON_PATH)
notebook_json = notebook.json()
page_json = notebook.pages[0].json()
cell_json = notebook.pages[0].cells[0].json()

url = "http://127.0.0.1:5000"
requests_info = {
    "/notebook/open": {"method": "POST", "data": {"path": OPEN_PATH}},
    "/notebook/new/from_pdf": {"method": "POST", "data": {"path": FROM_PDF_PATH}},
    "/notebook/new/from_text": {"method": "POST", "data": {"text": open(FROM_TEXT_PATH).read()}},  
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
