youtube_key = "AIzaSyAG32EmbWBvbjzyX3TO65v8gKfLs8mVE6Y"

from googleapiclient.discovery import build

query ="josh hutcherson whistle"
youtube = build('youtube', 'v3', developerKey=youtube_key)
request = youtube.search().list(part="snippet", maxResults=5, q=query, videoEmbeddable='true', type="video")
# request = youtube.videos().list(part="snippet", id="ZcpGJTI5GsY")

response = request.execute()

print([thing["id"]["videoId"] for thing in response["items"]])
# print(response["items"]["id"]["videoId"])
