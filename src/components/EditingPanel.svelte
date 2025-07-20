<script lang="ts">
  import { type Caption } from "src/types";

  let { currentCaption }: { currentCaption: Caption | undefined } = $props();

  function prependZeroes(number: number, length: number = 2) {
    return String(number).padStart(length, "0");
  }

  function formatTimestamp(seconds: number | undefined) {
    if (seconds == undefined) return "";
    return `${prependZeroes(Math.floor(seconds / 60))}:${prependZeroes(Math.floor(seconds % 60))}.${prependZeroes(Math.round((seconds - Math.floor(seconds)) * 1000), 3)}`;
  }
</script>

<div id="editing-panel">
  <div id="timestamp-row" class="row">
    <label for="start-time-input">Start</label>
    <input
      id="start-time-input"
      type="string"
      value={formatTimestamp(currentCaption?.times[0])}
    />

    <label for="end-time-input">End</label>
    <input
      id="end-time-input"
      type="string"
      value={formatTimestamp(currentCaption?.times[1])}
    />
  </div>

  <textarea>{currentCaption?.lines.join("\n")}</textarea>
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
</style>
