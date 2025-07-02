<script lang="ts">
  import Icon from "@iconify/svelte";

  let video: HTMLVideoElement = $state();
  let playing: boolean = $state(false);

  function togglePlayback() {
    if (playing) video.pause();
    else video.play();
    playing = !playing;
  }
</script>

<main>
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
          <div class="caption-line">Hello, world!</div>
          <div class="caption-line">Line 2</div>
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
</main>

<style>
  * {
    --videoWidth: 1280px;
  }

  #video-container {
    display: flex;
    flex-direction: column;
    width: var(--videoWidth);
  }

  #player-container {
    width: 100%;
    height: calc(var(--videoWidth) * (9 / 16));
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
    font-family: "Roboto";

    white-space: pre-wrap;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 32px;
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
</style>
