const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLVD_74rdRVm3RMbct6T7T9VgqeXPGBnZfRtQzqf5sXu-jFs30tTafK4Cn_9nWKvIUYTjvtu2kI3qz/pub?gid=0&single=true&output=csv";

let allData = [];

async function fetchData() {
    console.log("Fetching CSV...");
  try {
    const res = await fetch(
      `${CSV_URL}&t=${Date.now()}`,
      {
        cache: "no-store"
      }
    );
    const text = await res.text();

const rows = text.trim().split("\n");

// Split headers safely
const headers = rows[0].split(",").map(h => h.trim().toLowerCase());

// Find correct column indexes dynamically
const nameIndex = headers.indexOf("name");
const scoreIndex = headers.indexOf("score");

if (nameIndex === -1 || scoreIndex === -1) {
  throw new Error("CSV must contain 'Name' and 'Score' columns");
}

const dataRows = rows.slice(1);

allData = dataRows.map(row => {
  const cols = row.split(",");

  return {
    name: (cols[nameIndex] || "").trim(),
    points: parseInt(cols[scoreIndex]) || 0
  };
});

console.log("Response status:", res.status);
console.log("RAW TEXT:", text);

    render();
    updateTime();

  } catch (err) {
    document.getElementById("leaderboard").innerHTML =
      "<p>Error loading data</p>";
    console.error(err);
  }
}

function getRankedData(data) {
  data.sort((a, b) => b.points - a.points);

  let ranked = [];
  let rank = 1;

  for (let i = 0; i < data.length; i++) {
    if (i > 0 && data[i].points < data[i - 1].points) {
      rank = i + 1;
    }
    ranked.push({ ...data[i], rank });
  }

  return ranked;
}

function render() {
  const searchValue = document.getElementById("search").value?.toLowerCase() || "";
  const container = document.getElementById("leaderboard");

  let data = getRankedData([...allData]);

  // 👇 NEW
  renderChampionBanner(data);

  if (searchValue) {
    data = data.filter(d => d.name.toLowerCase().includes(searchValue));
  }

  container.innerHTML = data.map(player => {
    let cls = "";

    if (player.rank === 1) cls = "champion";

    return `
      <div class="row ${cls}">
        <div class="rank">${player.rank}</div>
        <div class="name">${player.name}</div>
        <div class="points">${player.points} pts</div>
      </div>
    `;
  }).join("");
}

function renderChampionBanner(data) {
  const banner = document.getElementById("championBanner");

  if (!data.length) return;

  const topScore = data[0].points;
  const leaders = data.filter(p => p.points === topScore);

  banner.innerHTML = `
    👑 <strong>🏆 Congratulations to our champion!${leaders.length > 1 ? "s" : ""}</strong><br/>
    ${leaders.map(p => `<span>${p.name} • ${p.points} pts</span>`).join("")}
  `;
}

function updateTime() {
  const now = new Date();
  document.getElementById("lastUpdated").innerText =
    "Last updated: " + now.toLocaleTimeString();
}

document.getElementById("search").addEventListener("input", render);

// Auto refresh every 60 seconds
setInterval(() => {
  console.log("Refreshing leaderboard...");
  fetchData();
}, 60000);

console.log("Auto-refresh enabled (60s)");

// Initial load
fetchData();
