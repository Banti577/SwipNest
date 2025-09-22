export function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const sec = Math.floor(seconds % 60);
  const min = Math.floor((seconds / 60) % 60);
  const hrs = Math.floor(seconds / 3600);

  if (hrs > 0) {
    return `${hrs}:${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }
}
