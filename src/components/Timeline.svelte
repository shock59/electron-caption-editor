<script lang="ts">
  import { type Caption, type CaptionDivData } from "src/types";
  import { onMount } from "svelte";

  let {
    captions,
    videoDuration,
    currentTime,
  }: { captions: Caption[]; videoDuration: number; currentTime: number } =
    $props();

  // This is used as the divisor for all width operations and sets the scale of the timeline
  // If set to videoDuration then a zoom level of 1 will fit exactly the entire video in the timeline.
  // However, that means the size of things will not be consistent across different video durations.
  const divisor = 500;

  function generateCaptionDivData() {
    console.log(videoDuration);

    let divData: CaptionDivData[] = [];
    const sortedCaptions = captions.toSorted((a, b) => a.times[0] - b.times[0]);

    divData.push({
      show: false,
      percent: sortedCaptions[0].times[0] / divisor,
      text: "",
    });

    for (let captionIndex in sortedCaptions) {
      const caption = sortedCaptions[captionIndex];
      divData.push({
        show: true,
        percent: (caption.times[1] - caption.times[0]) / divisor,
        text: caption.lines.join(" "),
      });

      if (Number(captionIndex) + 1 == sortedCaptions.length) continue;

      divData.push({
        show: false,
        percent:
          (sortedCaptions[Number(captionIndex) + 1].times[0] -
            caption.times[1]) /
          divisor,
        text: "",
      });
    }

    divData.push({
      show: false,
      percent: (videoDuration - sortedCaptions.at(-1).times[1]) / divisor,
      text: "",
    });

    return divData;
  }

  let captionDivData: CaptionDivData[] = $state();
  let timelineZoom: number = $state(5);

  onMount(() => {
    captionDivData = generateCaptionDivData();
  });
</script>

<div id="greater-timeline-container">
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
        style="margin-left: calc(var(--videoWidth) * {(currentTime / divisor) *
          timelineZoom} - 1px)"
      ></div>
    </div>
  </div>

  <div id="timeline-control-row" class="row">
    <div class="timeline-control">
      <label for="zoom-input">Zoom</label>
      <input
        bind:value={timelineZoom}
        type="range"
        min="1"
        max="10"
        step="0.1"
        id="zoom-input"
      />
    </div>
  </div>
</div>

<style>
  #greater-timeline-container {
    background: var(--color-bg-2);
    color: var(--color-fg-2);
  }

  #timeline-scrollable-container {
    transform: translate3d(0, 0, 0);
    width: var(--videoWidth);
    overflow-x: scroll;
    scrollbar-color: var(--color-fg-3) var(--color-bg-2);
    background: var(--color-bg-3);
  }

  #timeline {
    padding: 8px 0;
    display: flex;
    flex-direction: row;
    anchor-name: --timeline;
  }

  .timeline-caption {
    height: 32px;
    background: #a883ee;
    color: var(--color-bg-1);
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
    background: #215cff;
  }

  #timeline-control-row {
    padding: 4px;
  }

  .timeline-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: fit-content;
  }

  .timeline-control label {
    margin-right: 4px;
  }

  input[type="range"] {
    appearance: none;
    background: transparent;
    height: 16px;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    cursor: pointer;
    background: var(--color-fg-3);
    height: 10px;
    margin-top: 3px;
    border-radius: 10px;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    background: var(--color-fg-2);
    margin-top: -3px;
  }
</style>
