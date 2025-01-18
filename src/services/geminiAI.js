import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCkbXUlRUe4mQiEjEUgOyAxRAkaN4gm9hM");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper function to extract and clean JSON from response
function extractJsonFromResponse(text) {
  try {
    // Debug the input
    console.log('Raw text received:', text);

    // Basic cleanup first
    let cleanText = text
      // Remove anything before the first {
      .replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, '$1')
      // Remove control characters and normalize whitespace
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/\r?\n/g, ' ')
      .replace(/\s+/g, ' ')
      // Remove markdown markers
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Try direct parse first
    try {
      return JSON.parse(cleanText);
    } catch (e) {
      console.log('Direct parse failed:', e.message);
    }

    // More aggressive cleaning
    cleanText = cleanText
      // Fix common JSON issues
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/([^\\])\\([^"\\])/g, '$1\\\\$2')  // Fix single backslashes
      .replace(/\\'/g, "'")  // Remove escaped single quotes
      .replace(/\t/g, ' ')   // Replace tabs with spaces
      .trim();

    console.log('Cleaned JSON:', cleanText);

    try {
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Final parse attempt failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error extracting JSON:', error);
    throw error;
  }
}

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
      const prompt = `Create a blog post about ${topic}. Return a JSON object in this exact format, with no additional text or formatting:

{
  "title": "A clear, SEO-friendly title",
  "slug": "lowercase-url-friendly-title",
  "summary": "2-3 sentences summarizing the post",
  "content": "Main content of the post. Use simple text only, no special formatting.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "imageAlt": "Brief image description",
  "metaDescription": "SEO meta description",
  "sections": [
    {
      "title": "First Section",
      "content": "Section content here"
    }
  ],
  "author": {
    "name": "PawPedia Team",
    "bio": "Expert in dog care and training"
  },
  "readingTime": "5"
}

Important: Return ONLY the JSON object, no other text. Ensure all content is properly escaped.`;

      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2048,
          },
        });

        const text = result.response.text();
        const blogPost = extractJsonFromResponse(text);
        
        // Validate the blog post structure
        if (!blogPost || typeof blogPost !== 'object') {
          throw new Error('Invalid blog post: not an object');
        }

        const requiredFields = ['title', 'content', 'tags', 'summary', 'slug'];
        for (const field of requiredFields) {
          if (!blogPost[field]) {
            throw new Error(`Invalid blog post: missing ${field}`);
          }
        }

        if (!Array.isArray(blogPost.tags)) {
          throw new Error('Invalid blog post: tags must be an array');
        }

        return blogPost;
      } catch (error) {
        console.error('Error in blog post generation:', error);
        throw error;
      }
    };

    return await retryOperation(operation);
  }
}; 