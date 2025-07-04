export type Caption = {
  times: [number, number]; // [start time, end time] in seconds
  lines: string[];
};
export type CaptionDivData = {
  show: boolean;
  percent: number;
  text: string;
};
