<script lang="ts">
  import { type Caption, type CaptionDivData } from "src/types";
  import { onMount } from "svelte";

  let {
    captions,
    videoDuration,
  }: { captions: Caption[]; videoDuration: number } = $props();

  function generateCaptionDivData(captions: Caption[], videoDuration: number) {
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
    captionDivData = generateCaptionDivData(captions, videoDuration);
  });
</script>

<div id="timeline">
  {#each captionDivData as divData}
    <div
      class="timeline-caption {divData.show ? '' : 'timeline-caption-hidden'}"
      style="flex-basis: calc(var(--videoWidth) * {divData.percent} * {timelineZoom})"
    >
      <span>{divData.text}</span>
    </div>
  {/each}
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
  #timeline {
    width: var(--videoWidth);
    background: #202020;
    padding: 8px 0;
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
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
</style>
