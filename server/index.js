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

async function getStockPrice(symbol) {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query`,
        {
          params: {
            function: "GLOBAL_QUOTE",
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY,
          },
        }
      );
  
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
  

app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
  
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
    ];
  
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-0613",
        messages,
        functions,
      });
  
      const responseMessage = completion.choices[0].message;
  
      if (responseMessage.function_call) {
        const toolCall = responseMessage.function_call;
        const functionName = toolCall.name;
        const args = JSON.parse(toolCall.arguments);
  
        if (functionName === "getStockPrice") {
          const stockResult = await getStockPrice(args.symbol);
  
          const secondResponse = await openai.chat.completions.create({
            model: "gpt-4-0613",
            messages: [
              ...messages,
              responseMessage,
              {
                role: "function",
                name: "getStockPrice",
                content: JSON.stringify(stockResult),
              },
            ],
          });
  
          return res.json({ response: secondResponse.choices[0].message });
        }
      }
  
      return res.json({ response: responseMessage });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
app.listen(port, () => console.log(`Server listening on port ${port}`));
