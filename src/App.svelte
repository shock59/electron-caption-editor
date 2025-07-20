<script lang="ts">
  import { onMount } from "svelte";
  import Timeline from "./components/Timeline.svelte";
  import { type Caption } from "src/types";
  import EditingPanel from "./components/EditingPanel.svelte";
  import Video from "./components/Video.svelte";

  const videoCaptions: Caption[] = [
    { times: [1, 2.5], lines: ["Caption 1"] },
    { times: [6, 12], lines: ["Caption 2", "second line"] },
  ];

  let video: HTMLVideoElement = $state();
  let videoLoaded: boolean = $state(false);
  let playing: boolean = $state(false);
  let currentTime: number = $state(0);

  let currentCaption: Caption | undefined = $state(undefined);

  function togglePlayback() {
    if (playing) video.pause();
    else video.play();
    playing = !playing;
  }

  function onAnimationFrame() {
    currentTime = video.currentTime;

    if (
      currentCaption &&
      (currentCaption.times[0] > currentTime ||
        currentCaption.times[1] < currentTime)
    ) {
      currentCaption = undefined;
    }

    if (!currentCaption) {
      currentCaption = videoCaptions.find(
        (caption) =>
          caption.times[0] <= currentTime && caption.times[1] >= currentTime
      );
    }

    requestAnimationFrame(onAnimationFrame);
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
      <Timeline
        captions={videoCaptions}
        videoDuration={video.duration}
        {currentTime}
      />
    {/if}
  </div>

  <EditingPanel {currentCaption} />
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
