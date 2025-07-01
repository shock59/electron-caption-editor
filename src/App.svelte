<script lang="ts">
  let video: HTMLVideoElement;
</script>

<main>
  <div id="video-container">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video bind:this={video}>
      <source
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        type="video/mp4"
      />
    </video>

    <div id="caption-container">
      <span class="captions">Hello, world!</span>
    </div>
  </div>

  <br />

  <button
    onclick={() => {
      if (video.paused || video.ended) video.play();
      else video.pause();
    }}
    >{#if video?.paused || video?.ended}Play{:else}Pause{/if}</button
  >
</main>

<style>
  * {
    --videoWidth: 1280px;
  }

  #video-container {
    width: var(--videoWidth);
    height: calc(var(--videoWidth) * (9 / 16));
    anchor-name: --videoContainer;
  }

  video {
    width: 100%;
  }

  #caption-container {
    position-anchor: --videoContainer;
    position: fixed;
    bottom: calc(anchor(bottom) + 8px);

    width: var(--videoWidth);
    display: flex;
    justify-content: center;
  }

  .captions {
    width: fit-content;
    background: rgba(8, 8, 8, 0.75);
    color: #ffffff;
    font-family: "Roboto";
    padding: 0 0.25em;
    white-space: pre-wrap;
    display: inline-block;
    font-size: 32px;
  }
</style>
