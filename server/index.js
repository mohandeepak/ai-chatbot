import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Function to get current stock price using Alpha Vantage
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

// Mock function to get latest company news (replace with real API if you want)
async function getCompanyNews(symbol) {
  // Example: You could integrate a news API here
  return {
    symbol,
    headlines: [
      `Latest news headline 1 about ${symbol}`,
      `Latest news headline 2 about ${symbol}`,
      `Latest news headline 3 about ${symbol}`,
    ],
  };
}

// Mock function to get historical stock data (replace with real API if needed)
async function getHistoricalData(symbol, period = "1mo") {
  // Example: Return dummy data for now
  return {
    symbol,
    period,
    prices: [
      { date: "2025-07-01", close: 150 },
      { date: "2025-07-02", close: 152 },
      { date: "2025-07-03", close: 148 },
      // Add more data points or fetch real data from API
    ],
  };
}

// Define functions for OpenAI function calling
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

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    // First call: get GPT response + function call if needed
    const completion = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages,
      functions,
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.function_call) {
      // Parse function call and arguments
      const { name, arguments: argsString } = responseMessage.function_call;
      const args = JSON.parse(argsString);

      let functionResult;

      // Call the matching backend function
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

      // Second call: send function result back for natural language reply
      const secondCompletion = await openai.chat.completions.create({
        model: "gpt-4-0613",
        messages: [
          ...messages,
          responseMessage,
          {
            role: "function",
            name: name, // must exactly match the function_call name
            content: JSON.stringify(functionResult),
          },
        ],
      });

      return res.json({ response: secondCompletion.choices[0].message });
    }

    // No function call needed, just return GPT response
    res.json({ response: responseMessage });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
