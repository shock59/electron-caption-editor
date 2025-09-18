<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { type Caption } from "src/types";

  let {
    currentCaption,
    addNewCaption,
    updateCurrentCaption,
    videoDuration,
  }: {
    currentCaption: Caption | undefined;
    addNewCaption: () => void;
    updateCurrentCaption: (caption: Caption) => void;
    videoDuration: number;
  } = $props();

  let startTime: number | undefined = $state();
  let endTime: number | undefined = $state();
  let lines: string = $state();

  function prependZeroes(number: number, length: number = 2) {
    return String(number).padStart(length, "0");
  }

  function formatTimestamp(seconds: number | undefined) {
    if (seconds == undefined) return "";
    return `${prependZeroes(Math.floor(seconds / 60))}:${prependZeroes(Math.floor(seconds % 60))}.${prependZeroes(Math.round((seconds - Math.floor(seconds)) * 1000), 3)}`;
  }

  function triggerUpdateCurrentCaption() {
    if (
      startTime > videoDuration ||
      startTime < 0 ||
      endTime > videoDuration ||
      endTime < 0 ||
      startTime >= endTime
    ) {
      // TODO: Warn the user that they inputted invalid times.
      return;
    }
    updateCurrentCaption({
      times: [startTime, endTime],
      lines: lines.split("\n"),
    });
  }

  onMount(() => {
    if (currentCaption) {
      startTime = currentCaption.times[0];
      endTime = currentCaption.times[1];
      lines = currentCaption.lines.join("\n");
    } else {
      startTime = undefined;
      endTime = undefined;
      lines = "";
    }
  });
</script>

<div id="editing-panel">
  <div id="timestamp-row" class="row">
    <label for="start-time-input">Start</label>
    <input
      id="start-time-input"
      type="string"
      bind:value={startTime}
      onfocusout={triggerUpdateCurrentCaption}
      disabled={!currentCaption}
    />

    <label for="end-time-input">End</label>
    <input
      id="end-time-input"
      type="string"
      bind:value={endTime}
      onfocusout={triggerUpdateCurrentCaption}
      disabled={!currentCaption}
    />

    <button id="add-button" onclick={addNewCaption}>
      <Icon icon="mdi:add" width="24" height="24" />
    </button>
  </div>

  <textarea
    bind:value={lines}
    oninput={triggerUpdateCurrentCaption}
    disabled={!currentCaption}
  ></textarea>
</div>

<style>
  #editing-panel {
    height: inherit;
    background: var(--color-bg-2);
    color: #ffffff;
    margin-left: 8px;
    padding: 8px;
  }

  #timestamp-row {
    font-size: 16px;
    color: var(--color-fg-2);
    align-items: center;
    margin-bottom: 8px;
  }

  #timestamp-row label {
    margin-right: 4px;
  }

  #timestamp-row input {
    width: 75px;
    background: var(--color-bg-3);
    border: none;
    outline: none;
    padding: 4px;
    margin-right: 16px;
    font: inherit;
    color: var(--color-fg-1);
  }

  textarea {
    font-family: var(--captionFont);
    font-size: 20px;
    color: #ffffff;
    text-align: center;
    text-wrap-mode: nowrap;

    width: calc(var(--videoWidth) * 0.75);
    height: 100px;
    resize: none;

    background: #000000;

    border: 1px var(--color-fg-3) solid;
  }

  #add-button {
    padding: 0;
    margin: 0;
    margin-left: auto;
    outline: none;
    border: none;
    background: none;
    color: var(--color-fg-2);
  }
</style>
