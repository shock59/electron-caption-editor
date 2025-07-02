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

    <div id="captions-container">
      <div class="captions">
        <div class="caption-line">Hello, world!</div>
        <div class="caption-line">Line 2</div>
      </div>
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
    width: fit-content;
    padding: 0 0.25em;
    background: rgba(8, 8, 8, 0.75);
  }
</style>
