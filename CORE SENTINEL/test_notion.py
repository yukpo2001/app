import os
import sys

from notion_client import Client

try:
    notion = Client(auth="dummy")
    print(dir(notion.databases))
except Exception as e:
    print("Error:", e)
