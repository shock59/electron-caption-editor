<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";

  type Caption = {
    times: [number, number]; // [start time, end time] in seconds
    lines: string[];
  };
  type CaptionDivData = {
    show: boolean;
    percent: number;
    text: string;
  };

  const videoCaptions: Caption[] = [
    { times: [1, 2.5], lines: ["Caption 1"] },
    { times: [6, 12], lines: ["Caption 2", "second line"] },
  ];

  let video: HTMLVideoElement = $state();
  let playing: boolean = $state(false);

  let currentCaption: Caption | undefined = $state(undefined);
  let captionDivData: CaptionDivData[] = $state();

  function togglePlayback() {
    if (playing) video.pause();
    else video.play();
    playing = !playing;
  }

  function generateCaptionDivData(captions: Caption[]) {
    console.log(video.duration);

    let divData: CaptionDivData[] = [];
    const sortedCaptions = captions.toSorted((a, b) => a.times[0] - b.times[0]);

    divData.push({
      show: false,
      percent: sortedCaptions[0].times[0] / video.duration,
      text: "",
    });

    for (let captionIndex in sortedCaptions) {
      const caption = sortedCaptions[captionIndex];
      divData.push({
        show: true,
        percent: (caption.times[1] - caption.times[0]) / video.duration,
        text: caption.lines.join(" "),
      });

      if (Number(captionIndex) + 1 == sortedCaptions.length) continue;

      divData.push({
        show: false,
        percent:
          (sortedCaptions[Number(captionIndex) + 1].times[0] -
            caption.times[1]) /
          video.duration,
        text: "",
      });
    }

    return divData;
  }

  onMount(() => {
    video.addEventListener("loadedmetadata", () => {
      captionDivData = generateCaptionDivData(videoCaptions);
    });

    video.addEventListener("timeupdate", () => {
      const currentTime = video.currentTime;

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
    });
  });
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

  <div id="timeline">
    {#each captionDivData as divData}
      <div
        class="timeline-caption {divData.show ? '' : 'timeline-caption-hidden'}"
        style="width: calc(var(--videoWidth) * {divData.percent})"
      >
        <span>{divData.text}</span>
      </div>
    {/each}
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

  #timeline {
    width: var(--videoWidth);
    background: #202020;
    padding: 8px 0;
    display: flex;
    flex-direction: row;
  }

  .timeline-caption {
    height: 32px;
    background: rgb(138, 100, 209);
    text-overflow: clip;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .timeline-caption-hidden {
    background: none;
  }

  .timeline-caption span {
    margin: 0 8px;
    user-select: none;
  }
</style>
