import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const VideoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [channelInfo, setChannelInfo] = useState();
  const [videos, setVideos] = useState();
  // const [sentimentalStat, setSentimentalStat] = useState();
  const navigate = useNavigate();
  const goToCommentAnalysisPage = (videoId) =>
    navigate({
      pathname: "/commentAnalysis",
      search: "?video_id=" + videoId,
    });

  function getChannelInfo() {
    fetch(
      process.env.REACT_APP_CHANNEL_INFO_RESPONSE +
        "?channel_id=" +
        searchParams.get("channel_id"),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((response) => setChannelInfo(response[0]));
  }

  function getVideos() {
    fetch(
      process.env.REACT_APP_GET_VIDEOS_RESPONSE +
        "?channel_id=" +
        searchParams.get("channel_id"),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((response) => setVideos(response));
  }

  useEffect(() => {
    getChannelInfo();
    getVideos();
  }, []);

  return (
    <div class="min-w-fit">
      <Navbar />
      {channelInfo != null && videos != null ? (
        <div>
          <div class="flex flex-row mx-20 my-3 items-center gap-3 px-3">
            <img
              class="rounded-full w-20"
              src={channelInfo && channelInfo["channelProfileImageUrl"]}
            />
            <h1 class="text-3xl font-bold">
              {channelInfo && channelInfo["title"]}'s videos
            </h1>
          </div>
          <div class="mx-20">
            <table class="table-fixed">
              <thead class="bg-base-300">
                <tr>
                  <th class="w-2/12 p-3">Thumbnail</th>
                  <th class="w-3/12 p-3">Title</th>
                  <th class="p-3">View count</th>
                  <th class="p-3">Like count</th>
                  <th class="p-3">Comment count</th>
                  <th class="p-3">Published date</th>
                  <th class="p-3">Postive comments</th>
                  <th class="p-3">Negative comments</th>
                  <th class="p-3">Netural comments</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {videos &&
                  videos.map((video) => (
                    <tr>
                      <td class="p-3">
                        <img
                          class="object-cover rounded-lg"
                          src={video.thumbnails}
                        />
                      </td>
                      <td class="p-3">{video.title}</td>
                      <td class="text-center p-3">
                        {video.viewCount.toLocaleString()}
                      </td>
                      <td class="text-center p-3">
                        {video.likeCount.toLocaleString()}
                      </td>
                      <td class="text-center p-3">
                        {video.commentCount.toLocaleString()}
                      </td>
                      <td class="text-center p-3">
                        {video.publishedAt.slice(0, 10)}
                      </td>
                      <td class="text-center p-3">
                        {/* {sentimentalStat[video.id] !== undefined
                      ? sentimentalStat[video.id][0]
                      : "Not found"} */}
                        {video.positiveComments.toLocaleString()}
                      </td>
                      <td class="text-center p-3">
                        {/* {sentimentalStat[video.id] !== undefined
                      ? sentimentalStat[video.id][1]
                      : "Not found"} */}
                        {video.negativeComments.toLocaleString()}
                      </td>
                      <td class="text-center p-3">
                        {/* {sentimentalStat[video.id] !== undefined
                      ? sentimentalStat[video.id][2]
                      : "Not found"} */}
                        {video.neturalComments.toLocaleString()}
                      </td>
                      <td class="text-center p-3">
                        {video.commentCount !== 0 ? (
                          <button
                            class="btn btn-primary"
                            onClick={() => {
                              goToCommentAnalysisPage(video.id);
                            }}
                          >
                            See more
                          </button>
                        ) : (
                          "Not available"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div class="flex h-screen">
          <div class="m-auto">
            <div class="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
