<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import Timeline from "./components/Timeline.svelte";
  import { type Caption } from "src/types";

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

<main>
  <div class="row">
    <div class="column">
      <div id="video-container">
        <div id="player-container">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video bind:this={video}>
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              type="video/mp4"
            />
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

          <button>
            <Icon icon="mdi:arrow-back" width="24" height="24" />
          </button>

          <button onclick={togglePlayback}>
            {#if playing}
              <Icon icon="mdi:pause" width="24" height="24" />
            {:else}
              <Icon icon="mdi:play" width="24" height="24" />
            {/if}
          </button>

          <button>
            <Icon icon="mdi:arrow-forward" width="24" height="24" />
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
        </div>
      </div>

      {#if videoLoaded}
        <Timeline
          captions={videoCaptions}
          videoDuration={video.duration}
          {currentTime}
        />
      {/if}
    </div>

    <div id="editing-panel">
      <textarea>{currentCaption?.lines.join("\n")}</textarea>
    </div>
  </div>
</main>

<style>
  * {
    --videoWidth: 800px;
    --videoHeight: calc(var(--videoWidth) * (9 / 16));
    --captionFont: "Roboto";
  }

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
    margin: 8px 0;
  }

  button {
    margin: 0 4px;
  }

  textarea {
    font-family: var(--captionFont);
    font-size: 20px;
    text-align: center;
    text-wrap-mode: nowrap;
    width: calc(var(--videoWidth) * 0.75);
    margin-left: 8px;
    height: 100px;
  }
</style>
