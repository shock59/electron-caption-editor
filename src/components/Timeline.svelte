<script lang="ts">
  import { type Caption, type CaptionDivData } from "src/types";
  import { onMount } from "svelte";

  let {
    captions,
    videoDuration,
    currentTime,
  }: { captions: Caption[]; videoDuration: number; currentTime: number } =
    $props();

  function generateCaptionDivData() {
    console.log(videoDuration);

    let divData: CaptionDivData[] = [];
    const sortedCaptions = captions.toSorted((a, b) => a.times[0] - b.times[0]);

    divData.push({
      show: false,
      percent: sortedCaptions[0].times[0] / videoDuration,
      text: "",
    });

    for (let captionIndex in sortedCaptions) {
      const caption = sortedCaptions[captionIndex];
      divData.push({
        show: true,
        percent: (caption.times[1] - caption.times[0]) / videoDuration,
        text: caption.lines.join(" "),
      });

      if (Number(captionIndex) + 1 == sortedCaptions.length) continue;

      divData.push({
        show: false,
        percent:
          (sortedCaptions[Number(captionIndex) + 1].times[0] -
            caption.times[1]) /
          videoDuration,
        text: "",
      });
    }

    divData.push({
      show: false,
      percent: (videoDuration - sortedCaptions.at(-1).times[1]) / videoDuration,
      text: "",
    });

    return divData;
  }

  let captionDivData: CaptionDivData[] = $state();
  let timelineZoom: number = $state(1);

  onMount(() => {
    captionDivData = generateCaptionDivData();
  });
</script>

<div id="timeline-outer-container">
  <div id="timeline-scrollable-container">
    <div id="timeline">
      {#each captionDivData as divData}
        <div
          class="timeline-caption {divData.show
            ? ''
            : 'timeline-caption-hidden'}"
          style="flex-basis: calc(var(--videoWidth) * {divData.percent *
            timelineZoom})"
        >
          <span>{divData.text}</span>
        </div>
      {/each}
    </div>

    <div id="playhead-container">
      <div
        id="playhead"
        style="margin-left: calc(var(--videoWidth) * {(currentTime /
          videoDuration) *
          timelineZoom} - 1px)"
      ></div>
    </div>
  </div>
</div>

<p>
  <label for="zoom-input">Zoom</label>
  <input
    bind:value={timelineZoom}
    type="range"
    min="1"
    max="10"
    step="0.1"
    defaultValue="1"
    id="zoom-input"
  />
</p>

<style>
  #timeline-outer-container {
    overflow: hidden;
    transform: translate3d(0, 0, 0);
  }

  #timeline-scrollable-container {
    width: var(--videoWidth);
    overflow-x: scroll;
    background: #202020;
  }
  #timeline {
    padding: 8px 0;
    display: flex;
    flex-direction: row;
    anchor-name: --timeline;
  }

  .timeline-caption {
    height: 32px;
    background: rgb(138, 100, 209);
    text-overflow: clip;
    white-space: nowrap;
    overflow: hidden;
    flex-grow: 0;
    flex-shrink: 0;
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

  #playhead-container {
    position-anchor: --timeline;
    position: fixed;
    top: anchor(top);
    left: anchor(left);
    width: var(--videoWidth);
    height: calc(32px + (8px * 2));
  }

  #playhead {
    width: 2px;
    height: 100%;
    background: red;
  }
</style>
