<script lang="ts">
  import { type Caption } from "src/types";
  import Icon from "@iconify/svelte";

  let {
    video = $bindable(),
    videoLoaded = $bindable(false),
    playing = $bindable(false),
    currentTime = $bindable(0),
    currentCaption,
  }: {
    video: HTMLVideoElement;
    videoLoaded: boolean;
    playing: boolean;
    currentTime: number;
    currentCaption: Caption | undefined;
  } = $props();

  function togglePlayback() {
    if (playing) video.pause();
    else video.play();
    playing = !playing;
  }
</script>

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
      <Icon
        icon="mdi:arrow-back"
        onclick={() => {
          alert("The back one frame button has not been implemented yet :(");
        }}
        width="24"
        height="24"
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
        icon="mdi:arrow-forward"
        onclick={() => {
          alert("The forward one frame button has not been implemented yet :(");
        }}
        width="24"
        height="24"
      />
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
</style>
