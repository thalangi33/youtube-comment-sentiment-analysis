import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../Components/Navbar";

const CommentAnalysisPage = () => {
  const [videoAnalysis, setAnalysis] = useState();
  const [searchParams, setSearchParams] = useSearchParams();

  async function getVideoAnalysis() {
    fetch(
      process.env.REACT_APP_COMMENT_ANALYSIS_RESPONSE +
        "?video_id=" +
        searchParams.get("video_id"),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((response) => setAnalysis(response));
  }

  useEffect(() => {
    getVideoAnalysis();
  }, []);

  return (
    <div class="min-w-fir">
      <Navbar />
      {videoAnalysis != null ? (
        <div>
          <div class="flex justify-center">
            {videoAnalysis && (
              <div class="hero bg-base-200 w-9/12 rounded-lg">
                <div class="hero-content flex-row gap-5">
                  <img
                    src={videoAnalysis["video"]["thumbnails"]}
                    class="max-w-sm rounded-lg w-3/12"
                  />
                  <div class="flex flex-col gap-1">
                    <div class="flex flex-row gap-3">
                      <img
                        class="rounded-full w-20"
                        src={videoAnalysis["channel"]["channelProfileImageUrl"]}
                      />
                      <h1 class="text-3xl font-bold text-[#fafaf9]">
                        {videoAnalysis["video"]["title"]}
                      </h1>
                    </div>
                    <div class="font-semibold text-lg text-[#fafaf9]">
                      {videoAnalysis["channel"]["title"]}
                    </div>
                    <div class="font-semibold flex flex-row">
                      <div class="">
                        {videoAnalysis["video"]["viewCount"].toLocaleString()}{" "}
                        views
                      </div>
                      <div class="mx-1">•</div>
                      <div class="">
                        {videoAnalysis["video"]["likeCount"].toLocaleString()}{" "}
                        likes
                      </div>
                      <div class="mx-1">•</div>
                      <div class="">
                        {videoAnalysis["video"]["publishedAt"].slice(0, 10)}
                      </div>
                    </div>
                    <div class="font-semibold flex flex-row text-[#8b5cf6]">
                      <div class="">
                        {videoAnalysis["video"][
                          "commentCount"
                        ].toLocaleString()}{" "}
                        comments
                      </div>
                      <div class="mx-1">•</div>
                      <div class="">
                        {videoAnalysis["video"][
                          "positiveComments"
                        ].toLocaleString()}{" "}
                        postive comments
                      </div>
                      <div class="mx-1">•</div>
                      <div class="">
                        {videoAnalysis["video"][
                          "negativeComments"
                        ].toLocaleString()}{" "}
                        negative comments
                      </div>
                      <div class="mx-1">•</div>
                      <div class="">
                        {videoAnalysis["video"][
                          "neturalComments"
                        ].toLocaleString()}{" "}
                        netural comments
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div class="mx-20 flex justify-center gap-10">
            <div class="flex-1">
              <h1 class="text-3xl font-bold my-3">Top positive comments</h1>
              <ul class="list-none">
                {videoAnalysis &&
                  videoAnalysis["positiveComments"].map((comment) => (
                    <li class="my-3">
                      <div class="flex flex-row gap-3 items-center">
                        <img
                          class="rounded-full"
                          src={comment.authorProfileImageUrl}
                          alt="Profile"
                        />
                        <div>
                          <div class="font-semibold text-[#fafaf9]">
                            {comment.authorDisplayName}
                          </div>
                          <div class="text-[#fafaf9]">{comment.text}</div>
                          <div class="flex flex-row text-[#8b5cf6] font-semibold">
                            <div>{comment.likeCount} likes</div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
            <div div class="flex-1">
              <h1 class="text-3xl font-bold my-3">Top negative comments</h1>
              <ul class="list-none">
                {videoAnalysis &&
                  videoAnalysis["negativeComments"].map((comment) => (
                    <li class="my-3">
                      <div class="flex flex-row gap-3 items-center">
                        <img
                          class="rounded-full"
                          src={comment.authorProfileImageUrl}
                          alt=".Profile"
                        />
                        <div>
                          <div class="font-semibold text-[#fafaf9]">
                            {comment.authorDisplayName}
                          </div>
                          <div class="text-[#fafaf9]">{comment.text}</div>
                          <div class="flex flex-row text-[#8b5cf6] font-semibold">
                            <div>{comment.likeCount} likes</div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
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

export default CommentAnalysisPage;
