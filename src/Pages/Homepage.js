import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const Homepage = () => {
  const [availableChannels, setAvailableChannels] = useState();
  const [channelTitle, setChannelTitle] = useState("");
  const [searchedChannels, setSearchedChannels] = useState("");
  const navigate = useNavigate();
  const goToVideoPage = (channelId) =>
    navigate({
      pathname: "/video",
      search: "?channel_id=" + channelId,
    });

  // function searchChannelByTitle() {
  //   fetch(
  //     "https://?channelTitle=" +
  //       channelTitle,
  //     {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //       },
  //     }
  //   )
  //     .then((response) => response.json())
  //     .then((response) => setSearchedChannels(response));
  // }

  function getAllAvailableChannels() {
    fetch(process.env.REACT_APP_GET_ALL_AVAILABLE_CHANNELS, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => setAvailableChannels(response));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    // searchChannelByTitle();
    alert(`The name you entered was: ${channelTitle}`);
  };

  useEffect(() => {
    getAllAvailableChannels();
  }, []);

  return (
    <div class="min-w-max">
      <Navbar />
      <div>
        <div class="flex justify-center text-3xl my-5 font-medium">
          YouTube comments sentimental analysis
        </div>

        {/* <form class="flex justify-center" onSubmit={handleSubmit}>
          <label
            for="default-search"
            class="mb-2 text-sm font-medium text-gray-900 sr-only"
          >
            Search
          </label>
          <div class="relative mx-10 w-2/5">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              class="input block w-full input-bordered p-6 pl-10"
              placeholder="Enter YouTube channel title here"
              onChange={(e) => setChannelTitle(e.target.value)}
              required
            ></input>
            <button
              type="submit"
              class="btn btn-sm text-white absolute right-2.5 bottom-2"
            >
              Search
            </button>
          </div>
        </form> */}
      </div>
      <div class="flex flex-col items-center gap-10 my-10 min-w-max">
        {searchedChannels &&
          searchedChannels.map((channel) => (
            <div class="hero bg-base-300 w-4/5 rounded-md py-3">
              <div class="hero-content">
                <img
                  class="rounded-full"
                  src={channel.channelProfileImageUrl}
                />
                <div>
                  <h1 class="text-4xl font-bold">{channel.title}</h1>
                  <div class="grid grid-cols-3 gap-4 my-5">
                    <div class="bg-base-100 py-3 px-7">
                      <p class="text-xl font-medium">{channel.id}</p>
                      <p class="text-sm">Channel ID</p>
                    </div>
                    <div class="bg-base-100 py-3 px-7">
                      <p class="text-xl font-medium">
                        {channel.subscriberCount.toLocaleString()}
                      </p>
                      <p class="text-sm">Subscriber count</p>
                    </div>
                    <div class="bg-base-100 py-3 px-7">
                      <p class="text-xl font-medium">
                        {channel.videoCount.toLocaleString()}
                      </p>
                      <p class="text-sm">Video count</p>
                    </div>
                    <div class="bg-base-100 py-3 px-7">
                      <p class="text-xl font-medium">
                        {channel.viewCount.toLocaleString()}
                      </p>
                      <p class="text-sm">View count</p>
                    </div>
                    <div class="bg-base-100 py-3 px-7">
                      <p class="text-xl font-medium">{channel.country}</p>
                      <p class="text-sm">Country</p>
                    </div>
                  </div>
                  <button
                    class="btn btn-primary"
                    onClick={() => {
                      goToVideoPage(channel.id);
                    }}
                  >
                    Get Analysis
                  </button>
                </div>
              </div>
            </div>
          ))}
        {availableChannels != null ? (
          <div class="hero bg-base-300 w-10/12 rounded-md py-3 w-[1200px]">
            <div class="hero-content flex flex-col">
              <h1 class="text-2xl font-bold">Available analysis</h1>
              <ul class="list-none">
                {availableChannels.map((channel) => (
                  <li class="my-2 flex items-center gap-4 h-20">
                    <img
                      class="rounded-full w-20"
                      src={channel.channelProfileImageUrl}
                    />
                    <div class="grid grid-cols-3 gap-4 my-5">
                      <div class="bg-base-100 py-3 px-7">
                        <p class="text-xl font-medium truncate w-[350px]">
                          {channel.title}
                        </p>
                        <p class="text-sm">Channel title</p>
                      </div>
                      <div class="bg-base-100 py-3 px-7">
                        <p class="text-xl font-medium truncate w-[350px]">
                          {channel.subscriberCount.toLocaleString()}
                        </p>
                        <p class="text-sm">Subscriber count</p>
                      </div>
                      <div class="bg-base-100 py-3 px-7">
                        <p class="text-xl font-medium truncate w-[350px]">
                          {channel.viewCount.toLocaleString()}
                        </p>
                        <p class="text-sm">View count</p>
                      </div>
                    </div>
                    <button
                      class="btn btn-primary"
                      onClick={() => {
                        goToVideoPage(channel.id);
                      }}
                    >
                      Get Analysis
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div class="loading loading-spinner loading-lg"></div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
