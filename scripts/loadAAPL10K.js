// scripts/loadAAPL10K.js
import fs from "fs";
import { addToStore } from "../server/vectorStore.js";

const text = fs.readFileSync("data/aapl_10k_2023.txt", "utf-8");

// Split by paragraphs (double newlines), filter out short ones
const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);

const chunks = [];
let currentChunk = "";

for (const para of paragraphs) {
  if ((currentChunk + para).length > 1000) {
    chunks.push(currentChunk);
    currentChunk = para;
  } else {
    currentChunk += "\n" + para;
  }
}
if (currentChunk) chunks.push(currentChunk);

// Store chunks with metadata
for (let i = 0; i < chunks.length; i++) {
  await addToStore(`aapl-2023-chunk-${i}`, chunks[i], { symbol: "AAPL", year: 2023 });
}

console.log("Loaded AAPL 10-K into vector store.");
