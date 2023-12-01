youtube_key = "AIzaSyAG32EmbWBvbjzyX3TO65v8gKfLs8mVE6Y"

from googleapiclient.discovery import build

youtube = build('youtube', 'v3', developerKey=youtube_key)
request = youtube.videos().list(part="snippet", id="BbeeuzU5Qc8")

response = request.execute()

print(response)
