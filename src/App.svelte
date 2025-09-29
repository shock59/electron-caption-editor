<script lang="ts">
  import { onMount } from "svelte";
  import Timeline from "./components/Timeline.svelte";
  import { type Caption } from "src/types";
  import EditingPanel from "./components/EditingPanel.svelte";
  import Video from "./components/Video.svelte";

  let videoCaptions: Caption[] = $state([
    { times: [1, 2.5], lines: ["Caption 1"] },
    { times: [6, 12], lines: ["Caption 2", "second line"] },
  ]);

  let videoSrc: string = $state(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  );
  let video: HTMLVideoElement = $state();
  let videoLoaded: boolean = $state(false);
  let playing: boolean = $state(false);
  let currentTime: number = $state(0);

  let currentCaptionIndex: number = $state(0);
  let currentCaption: Caption | undefined = $state(undefined);

  let currentTimelineZoom: number = $state(5);

  function checkCurrentCaption() {
    if (
      currentCaption &&
      (currentCaption.times[0] > currentTime ||
        currentCaption.times[1] < currentTime)
    ) {
      currentCaption = undefined;
    }

    if (!currentCaption) {
      currentCaptionIndex = videoCaptions.findIndex(
        (caption) =>
          caption.times[0] <= currentTime && caption.times[1] >= currentTime
      );
      currentCaption = videoCaptions[currentCaptionIndex];
    }
  }

  function onAnimationFrame() {
    if (video.currentTime != currentTime) {
      currentTime = video.currentTime;
      checkCurrentCaption();
    }

    if (playing) {
      checkCurrentCaption();
    }

    requestAnimationFrame(onAnimationFrame);
  }

  function addNewCaption() {
    const newCaption: Caption = {
      times: [currentTime, currentTime + 2],
      lines: ["New Caption"],
    };

    const overlappingCaption = videoCaptions.find(
      (caption) =>
        // [  old  ]
        //   {new}
        (caption.times[0] < newCaption.times[0] &&
          caption.times[1] > newCaption.times[1]) ||
        //   [old]
        // {  new  }
        (caption.times[0] > newCaption.times[0] &&
          caption.times[1] < newCaption.times[1]) ||
        // [old]
        //    {new}
        (caption.times[0] < newCaption.times[0] &&
          caption.times[1] > newCaption.times[0]) ||
        //    [old]
        // {new}
        (caption.times[0] > newCaption.times[0] &&
          caption.times[0] < newCaption.times[1])
    );
    if (overlappingCaption) {
      alert(
        "You can't create a new caption here because it would overlap with an existing one!"
      );
      return;
    }

    videoCaptions = [...videoCaptions, newCaption];
  }

  function updateCurrentCaption(caption: Caption) {
    videoCaptions[currentCaptionIndex] = caption;
    currentCaption = videoCaptions[currentCaptionIndex];
    videoCaptions = [...videoCaptions];
  }

  function updateTimelineZoom(zoom: number) {
    currentTimelineZoom = zoom;
  }

  function onVideoLoaded() {
    videoLoaded = true;
  }

  function updateVideoTime(pos: number) {
    video.currentTime = video.duration * pos;
  }

  async function openVideo() {
    videoSrc = "";
    videoLoaded = false;
    videoSrc = await window.electronAPI.openVideo();
  }
  async function openFile() {
    const newCaptions = await window.electronAPI.openFile();
    videoCaptions = newCaptions;
  }
  function saveFile() {
    window.electronAPI.saveFile($state.snapshot(videoCaptions) as Caption[]);
  }

  onMount(() => {
    requestAnimationFrame(onAnimationFrame);
  });
</script>

<main class="row">
  <div class="column">
    {#key videoSrc}
      <Video
        bind:video
        bind:videoLoaded
        bind:playing
        bind:currentTime
        src={videoSrc}
        {currentCaption}
        {onVideoLoaded}
      />
    {/key}

    {#if videoLoaded}
      {#key videoCaptions}
        <Timeline
          captions={videoCaptions}
          videoDuration={video.duration}
          {currentTime}
          initialTimelineZoom={currentTimelineZoom}
          {updateTimelineZoom}
          {updateVideoTime}
        />
      {/key}
    {/if}
  </div>

  {#key currentCaptionIndex}
    <EditingPanel
      {currentCaption}
      {addNewCaption}
      {updateCurrentCaption}
      {openVideo}
      {openFile}
      {saveFile}
      videoDuration={video.duration}
    />
  {/key}
</main>

<style>
  * {
    --videoWidth: 800px;
    --videoHeight: calc(var(--videoWidth) * (9 / 16));
    --captionFont: "Roboto";
  }

  main {
    width: fit-content;
  }
</style>
