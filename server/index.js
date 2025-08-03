import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import { addToStore, queryStore} from "./vectorStore.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// ========== Load AAPL 10-K into vector store (basic chunking) ==========
const rawText = fs.readFileSync("../data/aapl_10k_2023.txt", "utf-8");
const paragraphs = rawText
  .split(/\n\s*\n/)
  .map(p => p.trim())
  .filter(p => p.length > 50);

const chunks = [];
let currentChunk = "";

for (const para of paragraphs) {
  if ((currentChunk + "\n" + para).length > 1000) {
    chunks.push(currentChunk);
    currentChunk = para;
  } else {
    currentChunk += "\n" + para;
  }
}
if (currentChunk) chunks.push(currentChunk);

async function loadChunks() {
  console.log(`⏳ Loading ${chunks.length} chunks into vector store...`);
  for (let i = 0; i < chunks.length; i++) {
    await addToStore(`aapl-chunk-${i}`, chunks[i], { symbol: "AAPL", year: 2023 });
  }
  console.log("✅ Finished loading 10-K chunks.");
}

loadChunks(); 

// ========== Existing Stock Price Function ==========
async function getStockPrice(symbol) {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const data = response.data["Global Quote"];

    if (!data || Object.keys(data).length === 0) {
      return { symbol, price: "Symbol not found or no data" };
    }

    const price = parseFloat(data["05. price"]);
    return { symbol, price };
  } catch (error) {
    console.error("Error fetching stock price:", error.message);
    return { symbol, price: "Error fetching price" };
  }
}

// ========== Mock Company News ==========
async function getCompanyNews(symbol) {
  return {
    symbol,
    headlines: [
      `Latest news headline 1 about ${symbol}`,
      `Latest news headline 2 about ${symbol}`,
      `Latest news headline 3 about ${symbol}`,
    ],
  };
}

// ========== Mock Historical Data ==========
async function getHistoricalData(symbol, period = "1mo") {
  return {
    symbol,
    period,
    prices: [
      { date: "2025-07-01", close: 150 },
      { date: "2025-07-02", close: 152 },
      { date: "2025-07-03", close: 148 },
    ],
  };
}

// ========== OpenAI Functions ==========
const functions = [
  {
    name: "getStockPrice",
    description: "Get the current stock price for a given company",
    parameters: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The stock ticker symbol, e.g. AAPL for Apple",
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "getCompanyNews",
    description: "Get the latest news headlines for a company",
    parameters: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The stock ticker symbol, e.g. MSFT for Microsoft",
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "getHistoricalData",
    description: "Get historical stock data for a company over a time period",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "The stock ticker symbol" },
        period: {
          type: "string",
          description: "Time period, e.g. '1mo', '3mo', '1y'",
        },
      },
      required: ["symbol", "period"],
    },
  },
];

// ========== Main Chat Endpoint with RAG Integration ==========
app.post("/api/chat", async (req, res) => {
  const { messages, useRag } = req.body;

  try {
    if (useRag) {
      const userMessage = messages[messages.length - 1].content;

      const topDocs = await queryStore(userMessage, 7);

      const context = topDocs.map(doc => doc.text).join("\n---\n");

      const prompt = `
      You are a financial expert AI assistant.

      ONLY answer based on the excerpts below from Apple's 2023 10-K filing.
      If the answer is not found, reply exactly: "Information not found in the document."
      
      Context:
      ${context}
      
      Question:
      ${userMessage}
      
`;

      const ragResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      return res.json({
        response: ragResponse.choices[0].message,
        sources: topDocs.map(d => d.meta),
      });
    }

    // ========== Regular GPT Chat + Function Calling ==========
    const completion = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages,
      functions,
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.function_call) {
      const { name, arguments: argsString } = responseMessage.function_call;
      const args = JSON.parse(argsString);

      let functionResult;

      switch (name) {
        case "getStockPrice":
          functionResult = await getStockPrice(args.symbol);
          break;
        case "getCompanyNews":
          functionResult = await getCompanyNews(args.symbol);
          break;
        case "getHistoricalData":
          functionResult = await getHistoricalData(args.symbol, args.period);
          break;
        default:
          functionResult = { error: "Function not implemented" };
      }

      const secondCompletion = await openai.chat.completions.create({
        model: "gpt-4-0613",
        messages: [
          ...messages,
          responseMessage,
          {
            role: "function",
            name: name,
            content: JSON.stringify(functionResult),
          },
        ],
      });

      return res.json({ response: secondCompletion.choices[0].message });
    }

    res.json({ response: responseMessage });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
