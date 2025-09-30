<script lang="ts">
  import { onMount } from "svelte";
  import { type Caption } from "src/types";
  import Icon from "@iconify/svelte";

  let {
    video = $bindable(),
    videoLoaded = $bindable(false),
    playing = $bindable(false),
    currentTime = $bindable(0),
    src,
    currentCaption,
    onVideoLoaded,
  }: {
    video: HTMLVideoElement;
    videoLoaded: boolean;
    playing: boolean;
    currentTime: number;
    src: string;
    currentCaption: Caption | undefined;
    onVideoLoaded: () => void;
  } = $props();

  let frame = $state(0);

  function prependZeroes(number: number, length: number = 2) {
    return String(number).padStart(length, "0");
  }

  function formatTimestamp(seconds: number | undefined) {
    if (seconds == undefined) return "";
    return `${prependZeroes(Math.floor(seconds / 60))}:${prependZeroes(Math.floor(seconds % 60))}`;
  }

  function togglePlayback() {
    if (playing) video.pause();
    else video.play();
    playing = !playing;
  }

  function onAnimationFrame() {
    frame++;
    requestAnimationFrame(onAnimationFrame);
  }

  onMount(() => {
    video.addEventListener("loadeddata", onVideoLoaded);
    onAnimationFrame();
  });
</script>

<div id="video-container">
  <div id="player-container">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video bind:this={video}>
      <source {src} type="video/mp4" />
    </video>

    <div id="captions-container">
      <div class="captions">
        {#each currentCaption?.lines as line}
          <div class="caption-line">{line}</div>
        {/each}
      </div>
    </div>
  </div>

  <div id="button-row">
    {#key frame}
      <span id="left"
        >{formatTimestamp(video?.currentTime)} / {formatTimestamp(
          video?.duration
        )}</span
      >
    {/key}

    <button>
      <Icon
        icon="mdi:rewind-5"
        width="24"
        height="24"
        onclick={() => {
          video.currentTime -= 5;
        }}
      />
    </button>

    <button onclick={togglePlayback}>
      {#if playing}
        <Icon icon="mdi:pause" width="24" height="24" />
      {:else}
        <Icon icon="mdi:play" width="24" height="24" />
      {/if}
    </button>

    <button>
      <Icon
        icon="mdi:fast-forward-5"
        width="24"
        height="24"
        onclick={() => {
          video.currentTime += 5;
        }}
      />
    </button>

    {#key frame}
      <span id="right"
        >{video?.currentTime.toFixed(3)} / {video?.duration.toFixed(3)}</span
      >
    {/key}
  </div>
</div>

<style>
  #video-container {
    display: flex;
    flex-direction: column;
    width: var(--videoWidth);
  }

  #player-container {
    width: 100%;
    height: var(--videoHeight);
    anchor-name: --videoContainer;
  }

  video {
    width: 100%;
  }

  #captions-container {
    position-anchor: --videoContainer;
    position: fixed;
    bottom: calc(anchor(bottom) + 8px);

    width: var(--videoWidth);
    display: flex;
    justify-content: center;
  }

  .captions {
    width: fit-content;

    color: #ffffff;
    font-family: var(--captionFont);

    white-space: pre-wrap;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 20px;
  }

  .caption-line {
    text-align: center;
    user-select: none;
    width: fit-content;
    padding: 0 0.25em;
    background: rgba(8, 8, 8, 0.75);
  }

  #button-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 4px 0;
    margin-bottom: 8px;
    background: var(--color-bg-2);
  }

  button {
    padding: 4px 8px;
    margin: 0 4px;
    outline: none;
    border: none;
    background: none;
    color: var(--color-fg-2);
  }

  span {
    width: 200px;
    color: var(--color-fg-2);

    font-family: "Inter", sans-serif;
    font-variant-numeric: tabular-nums;
  }
  span#left {
    margin: auto;
    margin-left: 8px;
  }
  span#right {
    margin: auto;
    margin-right: 8px;
    text-align: right;
  }
</style>
