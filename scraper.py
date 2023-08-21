import pandas as pd
from googleapiclient.discovery import build
import datetime
import os
from dotenv import load_dotenv

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from google.cloud import bigquery

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "api-credentials.json"

client = bigquery.Client()

load_dotenv()

api_service_name = "youtube"
api_version = "v3"
DEVELOPER_KEY = os.getenv('API_KEY')

youtube = build(
    api_service_name, api_version, developerKey=DEVELOPER_KEY)

sia = SentimentIntensityAnalyzer()

def get_channel_stats(youtube, channel_id):
    channel_stat = {}

    request = youtube.channels().list(
        part="snippet,contentDetails,statistics",
        id=channel_id
    )
    response = request.execute()

    data = response["items"][0]

    channel_stat["id"] = data["id"]
    channel_stat["title"] = data["snippet"]["title"]
    channel_stat["description"] = data["snippet"]["description"]
    channel_stat["country"] = data["snippet"]["country"]
    channel_stat["viewCount"] = int(data["statistics"]["viewCount"])
    channel_stat["subscriberCount"] = int(data["statistics"]["subscriberCount"])
    channel_stat["videoCount"] = int(data["statistics"]["videoCount"])
    channel_stat["uploadsPlaylistId"] = data["contentDetails"]["relatedPlaylists"]["uploads"]
    channel_stat["lastUpdated"] = datetime.datetime.now()
    channel_stat["channelProfileImageUrl"] = data["snippet"]["thumbnails"]["high"]["url"]

    return channel_stat


def get_video_ids(youtube, playlist_id, channelId):
    video_ids = []

    request = youtube.playlistItems().list(
        part="snippet,contentDetails",
        playlistId=playlist_id,
        maxResults=50
    )
    response = request.execute()

    for item in response['items']:
        video_ids.append(item['contentDetails']['videoId'])

    next_page_token = response.get('nextPageToken')
    while next_page_token is not None:
        request = youtube.playlistItems().list(
            part='contentDetails',
            playlistId=playlist_id,
            maxResults=50,
            pageToken=next_page_token)
        response = request.execute()

        for item in response['items']:
            video_ids.append(item['contentDetails']['videoId'])

        next_page_token = response.get('nextPageToken')

    return video_ids


def get_video_details(youtube, video_ids):

    all_video_info = []

    for i in range(0, len(video_ids), 50):
        request = youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=','.join(video_ids[i:i+50])
        )
        response = request.execute()

        for video in response['items']:
            stats_to_keep = {'snippet': ['channelId', 'title', 'description', 'tags', 'publishedAt'],
                             'statistics': ['viewCount', 'likeCount', 'commentCount']
                             }
            video_info = {}
            video_info['id'] = video['id']
            video_info["thumbnails"] = video["snippet"]["thumbnails"]["high"]["url"]
            video_info["lastUpdated"] = datetime.datetime.now()

            for k in stats_to_keep.keys():
                if k == 'statistics':
                    for v in stats_to_keep[k]:
                        try:
                            video_info[v] = int(video[k][v])
                        except:
                            video_info[v] = None
                else:
                    for v in stats_to_keep[k]:
                        try:
                            video_info[v] = video[k][v]
                        except:
                            video_info[v] = None

            all_video_info.append(video_info)

    return all_video_info


def get_video_comments(youtube, video_id):
    all_comments = []

    request = youtube.commentThreads().list(
        part="snippet,replies",
        videoId=video_id,
        maxResults=50,
    )

    try:
        response = request.execute()

        for item in response["items"]:
            comment = {}
            comment["id"] = item["id"]
            comment["videoId"] = item["snippet"]["videoId"]
            comment["text"] = item["snippet"]["topLevelComment"]["snippet"]["textOriginal"]
            comment["authorDisplayName"] = item["snippet"]["topLevelComment"]["snippet"]["authorDisplayName"]
            comment["authorProfileImageUrl"] = item["snippet"]["topLevelComment"]["snippet"]["authorProfileImageUrl"]
            comment["authorChannelUrl"] = item["snippet"]["topLevelComment"]["snippet"]["authorChannelUrl"]
            comment["authorChannelId"] = item["snippet"]["topLevelComment"]["snippet"]["authorChannelId"]["value"]
            comment["likeCount"] = int(item["snippet"]["topLevelComment"]["snippet"]["likeCount"])
            comment["publishedAt"] = item["snippet"]["topLevelComment"]["snippet"]["publishedAt"]
            comment["updatedAt"] = item["snippet"]["topLevelComment"]["snippet"]["updatedAt"]
            comment["lastUpdated"] = datetime.datetime.now()
            all_comments.append(comment)

        next_page_token = response.get('nextPageToken')
        more_pages = True

        while more_pages:
            if next_page_token is None:
                more_pages = False
            else:
                request = youtube.commentThreads().list(
                    part="snippet,replies",
                    videoId=video_id,
                    maxResults=50,
                    pageToken=next_page_token
                )
                response = request.execute()

                for item in response["items"]:
                    comment = {}
                    comment["id"] = item["id"]
                    comment["videoId"] = item["snippet"]["videoId"]
                    comment["text"] = item["snippet"]["topLevelComment"]["snippet"]["textOriginal"]
                    comment["authorDisplayName"] = item["snippet"]["topLevelComment"]["snippet"]["authorDisplayName"]
                    comment["authorProfileImageUrl"] = item["snippet"]["topLevelComment"]["snippet"]["authorProfileImageUrl"]
                    comment["authorChannelUrl"] = item["snippet"]["topLevelComment"]["snippet"]["authorChannelUrl"]
                    comment["authorChannelId"] = item["snippet"]["topLevelComment"]["snippet"]["authorChannelId"]["value"]
                    comment["likeCount"] = int(item["snippet"]["topLevelComment"]["snippet"]["likeCount"])
                    comment["publishedAt"] = item["snippet"]["topLevelComment"]["snippet"]["publishedAt"]
                    comment["updatedAt"] = item["snippet"]["topLevelComment"]["snippet"]["updatedAt"]
                    comment["lastUpdated"] = datetime.datetime.now()
                    all_comments.append(comment)

                next_page_token = response.get('nextPageToken')

        return all_comments
    except:
        print("Cannot crawl the comments of this video: {}".format(video_id))
        return []
    
def load_dataframe_to_big_query(dataframe, dataset_name, table_name):
    table_id = "{}.{}.{}".format(client.project, dataset_name, table_name)

    job = client.load_table_from_dataframe(
        dataframe, table_id
    )
    job.result()  # Wait for the job to complete.

    table = client.get_table(table_id)  # Make an API request.
    print(
        "Loaded {} rows and {} columns to {}".format(
            table.num_rows, len(table.schema), table_id
        )
    )

def sentiment_analyzer(comments):
    all_comment_analysis = []
    pos_total = 0
    neg_total = 0
    neu_total = 0

    for comment in comments:
        comment_analysis = {}

        text = comment["text"]
        ss = sia.polarity_scores(str(text))

        if ss["pos"] > 0.3:
            pos_total = pos_total + 1
        elif ss["neg"] > 0.3:
            neg_total = neg_total + 1
        else:
            neu_total = neu_total + 1

        comment_analysis["id"] = comment["id"]
        comment_analysis["positiveScore"] = ss["pos"]
        comment_analysis["negativeScore"] = ss["neg"]
        comment_analysis["neutralScore"] = ss["neu"]
        comment_analysis["compoundScore"] = ss["compound"]

        all_comment_analysis.append(comment_analysis)


    print("Total positive comments: {}".format(pos_total))
    print("Total negative comments: {}".format(neg_total))
    print("Total neutral comments: {}".format(neu_total))

def sentiment_analyzer_combined(comments, video):
    pos_total = 0
    neg_total = 0
    neu_total = 0

    for comment in comments:
        text = comment["text"]
        ss = sia.polarity_scores(str(text))

        if ss["pos"] > 0.3:
            pos_total = pos_total + 1
        elif ss["neg"] > 0.3:
            neg_total = neg_total + 1
        else:
            neu_total = neu_total + 1

        comment["positiveScore"] = ss["pos"]
        comment["negativeScore"] = ss["neg"]
        comment["neutralScore"] = ss["neu"]
        comment["compoundScore"] = ss["compound"]
    
    video["positiveComments"] = pos_total
    video["negativeComments"] = neg_total
    video["neturalComments"] = neu_total


channel_id = os.getenv('CHANNEL_ID_TO_SEARCH')

print("Getting channel stats...")
channel_stat = get_channel_stats(youtube, channel_id)

print("Getting video_ids stats...")
video_ids = get_video_ids(youtube, channel_stat["uploadsPlaylistId"], channel_id)

print("Getting video details stats...")
video_details = get_video_details(youtube, video_ids)

print("Getting video comments stats...")
comments = []
for index, video_id in enumerate(video_ids):
    comments += get_video_comments(youtube, video_id)
    sentiment_analyzer_combined(comments, video_details[index])

print("Converting channel stats to csv...")
df_channels = pd.DataFrame([channel_stat])

print("Converting videos to csv...")
df_videos = pd.DataFrame(video_details)

print("Converting comments to csv...")
df_comments = pd.DataFrame(comments)

print("Loading channel stats to BigQuery...")
load_dataframe_to_big_query(df_channels, "youtube_comment_sentiment_analysis", "channels")

print("Loading video details to BigQuery...")
load_dataframe_to_big_query(df_videos, "youtube_comment_sentiment_analysis", "videos")

print("Loading comments to BigQuery...")
load_dataframe_to_big_query(df_comments, "youtube_comment_sentiment_analysis", "comments")
