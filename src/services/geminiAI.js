import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCkbXUlRUe4mQiEjEUgOyAxRAkaN4gm9hM");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper function to extract and clean JSON from response
const extractJsonFromResponse = (text) => {
  try {
    // Remove any markdown formatting and get everything between the first { and last }
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No valid JSON object found in response');
      return null;
    }

    let jsonText = text.slice(jsonStart, jsonEnd + 1);

    // Basic cleanup of common issues
    jsonText = jsonText
      .replace(/\n\s*/g, ' ') // Replace newlines and following spaces with a single space
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/(?<!\\)"/g, '\\"') // Escape unescaped quotes
      .replace(/\\"/g, '"') // Fix double-escaped quotes
      .trim();

    // Parse the cleaned JSON
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.error('Original text:', text);
    console.error('Cleaned JSON text:', jsonText);
    return null;
  }
};

// Helper function to retry failed requests
const retryOperation = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation();
      if (result) return result;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return null;
};

export const geminiService = {
  async generateBreedInfo(breed, subBreed = null) {
    const operation = async () => {
      const breedName = subBreed ? `${subBreed} ${breed}` : breed;
      const prompt = `Generate a valid JSON object about the ${breedName} dog breed with this structure (no additional text or formatting):
{
  "description": "A comprehensive description of the breed",
  "characteristics": ["List of 5 physical characteristics"],
  "temperament": ["List of 5 temperament traits"],
  "care": ["List of 5 care requirements"],
  "history": "Brief history of the breed",
  "suitability": ["List of 3-5 ideal living situations"],
  "health": ["List of 3-5 common health considerations"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return extractJsonFromResponse(text);
    };

    try {
      return await retryOperation(operation);
    } catch (error) {
      console.error('Error generating breed info:', error);
      return null;
    }
  },

  async generateDogFacts(count = 20) {
    const operation = async () => {
      const prompt = `Generate a valid JSON object with ${count} dog facts with this structure (no additional text or formatting):
{
  "facts": [
    "Fact 1",
    "Fact 2",
    "..."
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = extractJsonFromResponse(text);
      return parsed?.facts || [];
    };

    try {
      return await retryOperation(operation);
    } catch (error) {
      console.error('Error generating dog facts:', error);
      return null;
    }
  },

  async generateDogFactDetails(fact) {
    const operation = async () => {
      const prompt = `Generate a valid JSON object about this dog fact: "${fact}" with this structure (no additional text or formatting):
{
  "title": "A catchy title for this fact",
  "explanation": "Detailed scientific explanation",
  "additionalInfo": ["3-5 related interesting points"],
  "sources": ["2-3 scientific sources or studies"],
  "relatedFacts": ["3 related dog facts"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return extractJsonFromResponse(text);
    };

    try {
      return await retryOperation(operation);
    } catch (error) {
      console.error('Error generating fact details:', error);
      return null;
    }
  },

  async generateBlogPost(topic) {
    const operation = async () => {
      const prompt = `Generate a valid JSON object for a blog post about ${topic} with this structure (no additional text or formatting):
{
  "title": "An SEO-friendly title",
  "slug": "url-friendly-version-of-title",
  "summary": "A brief 2-3 sentence summary",
  "content": "The full blog post content",
  "tags": ["5-7 relevant tags"],
  "imageAlt": "Descriptive alt text for the featured image",
  "metaDescription": "SEO-friendly meta description",
  "sections": [
    {
      "title": "Section title",
      "content": "Section content"
    }
  ],
  "author": {
    "name": "PawPedia Team",
    "bio": "Expert in dog care and training"
  },
  "readingTime": "Estimated reading time in minutes"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return extractJsonFromResponse(text);
    };

    try {
      return await retryOperation(operation);
    } catch (error) {
      console.error('Error generating blog post:', error);
      return null;
    }
  }
}; 