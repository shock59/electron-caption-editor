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

  let video: HTMLVideoElement = $state();
  let videoLoaded: boolean = $state(false);
  let playing: boolean = $state(false);
  let currentTime: number = $state(0);

  let currentCaptionIndex: number = $state(0);
  let currentCaption: Caption | undefined = $state(undefined);

  let currentTimelineZoom: number = $state(5);

  function onAnimationFrame() {
    if (!playing) {
      return requestAnimationFrame(onAnimationFrame);
    }

    currentTime = video.currentTime;

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

  onMount(() => {
    video.addEventListener("loadedmetadata", () => {
      videoLoaded = true;
    });

    requestAnimationFrame(onAnimationFrame);
  });
</script>

<main class="row">
  <div class="column">
    <Video
      bind:video
      bind:videoLoaded
      bind:playing
      bind:currentTime
      {currentCaption}
    />

    {#if videoLoaded}
      {#key videoCaptions}
        <Timeline
          captions={videoCaptions}
          videoDuration={video.duration}
          {currentTime}
          initialTimelineZoom={currentTimelineZoom}
          {updateTimelineZoom}
        />
      {/key}
    {/if}
  </div>

  {#key currentCaptionIndex}
    <EditingPanel {currentCaption} {addNewCaption} {updateCurrentCaption} />
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
