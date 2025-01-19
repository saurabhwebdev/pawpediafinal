import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCkbXUlRUe4mQiEjEUgOyAxRAkaN4gm9hM");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper function to extract and clean JSON from response
function extractJsonFromResponse(text) {
  try {
    // Debug the input
    console.log('Raw text received:', text);

    // Remove markdown code block markers
    text = text.replace(/```JSON\s*/g, '').replace(/```\s*$/g, '');

    // Find the first { and last } to extract just the JSON object
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    
    if (start === -1 || end === 0) {
      throw new Error('No JSON object found in response');
    }

    let jsonText = text.slice(start, end);

    // Basic cleanup
    jsonText = jsonText
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      // Remove any remaining markdown or code block markers
      .replace(/```[a-zA-Z]*\s*/g, '')
      .replace(/```/g, '')
      .trim();

    // Try to parse
    try {
      return JSON.parse(jsonText);
    } catch (e) {
      console.log('Initial parse failed, trying additional cleanup...', e.message);
      
      // More aggressive cleanup
      jsonText = jsonText
        // Fix escaped quotes
        .replace(/\\"/g, '"')
        .replace(/"\s+"/g, '","')
      // Fix common JSON issues
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        // Remove trailing commas in arrays
        .replace(/,(\s*[\]}])/g, '$1')
        // Ensure proper quotes around property names
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
        // Fix double quotes
        .replace(/""+/g, '"')
        // Remove any remaining special characters
        .replace(/[^\x20-\x7E]/g, '')
      .trim();

      console.log('Cleaned JSON:', jsonText);

      // Try parsing again
      return JSON.parse(jsonText);
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

  async generateBlogPost(topic, products = []) {
    const operation = async () => {
      // Simplify product formatting
      const formattedProducts = products.map(p => ({
        title: p.title || '',
        price: String(p.price || ''),
        rating: String(p.rating || ''),
        reviews: String(p.reviews || '0'),
        link: p.link || '',
      }));

      // Create product markdown links for content
      const productLinks = formattedProducts.map(p => 
        `[${p.title}](${p.link})`
      );

      // Modify topic if it's future-oriented
      const currentYear = new Date().getFullYear();
      const modifiedTopic = topic.replace(/\b\d{4}\b/g, match => {
        const year = parseInt(match);
        if (year > currentYear) {
          return `${currentYear} and Trends`;
        }
        return match;
      });

      // First, get research and statistics
      const researchPrompt = `Research current statistics, studies, and expert insights about: "${modifiedTopic}"
Focus on current trends and data-backed projections. Return a JSON object with:
{
  "key_statistics": ["3-5 current statistics with sources"],
  "research_findings": ["3-5 findings from recent studies"],
  "expert_insights": ["2-3 expert opinions or recommendations"],
  "sources": ["List of scientific papers, journals, or reputable sources"]
}`;

      let researchData;
      try {
        const researchResult = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: researchPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        });

        researchData = extractJsonFromResponse(researchResult.response.text());
        if (!researchData) {
          researchData = {
            key_statistics: ["According to the American Kennel Club's latest data..."],
            research_findings: ["Recent studies show evolving trends in dog breed popularity..."],
            expert_insights: ["Veterinarians and breed experts suggest considering factors like lifestyle fit..."],
            sources: ["American Kennel Club (AKC)", "Veterinary Medicine International"]
          };
        }
      } catch (error) {
        console.warn('Research data generation failed, using fallback data');
        researchData = {
          key_statistics: ["According to the American Kennel Club's latest data..."],
          research_findings: ["Recent studies show evolving trends in dog breed popularity..."],
          expert_insights: ["Veterinarians and breed experts suggest considering factors like lifestyle fit..."],
          sources: ["American Kennel Club (AKC)", "Veterinary Medicine International"]
        };
      }

      // Main content generation with research incorporation
      const contentPrompt = `Write a comprehensive, high-quality blog post about "${modifiedTopic}". 

REQUIREMENTS:
- Length: STRICTLY MINIMUM 400 words
- Each section should be at least 100 words
- Style: Professional, informative, and engaging
- Tone: Expert but accessible
- Focus: Current trends and data-backed insights
- Format: Well-structured with clear sections
- Citations: Include research citations in (Author, Year) format

INCORPORATE THIS RESEARCH:
${JSON.stringify(researchData, null, 2)}

PRODUCT RECOMMENDATIONS:
Include these products as clickable links where naturally relevant:
${formattedProducts.map(p => `- ${productLinks[formattedProducts.indexOf(p)]} (₹${p.price} - ${p.rating} stars, ${p.reviews} reviews)`).join('\n')}

DETAILED STRUCTURE:
1. Introduction (100+ words):
   - Hook readers with compelling statistics
   - Set context and importance
   - Preview main points

2. Current Trends and Analysis (100+ words):
   - Detailed analysis of current statistics
   - Expert insights and interpretations
   - Market trends and patterns

3. Practical Insights (100+ words):
   - Key considerations
   - Expert recommendations
   - Product suggestions where relevant

4. Conclusion (100+ words):
   - Key takeaways
   - Final recommendations
   - Call to action

IMPORTANT:
- Ensure MINIMUM 400 words total length
- Focus on current trends and data-backed projections
- Use exact [Product Name](Product URL) format for product links
- Support claims with research citations
- Maintain professional tone throughout
- Focus on providing valuable, actionable information
- Include relevant statistics and expert quotes`;

      try {
        // Generate the main content with increased token limit
        const contentResult = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: contentPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2048,
          },
        });

        // Use let instead of const for contentText since we might need to reassign it
        let contentText = contentResult.response.text();
        if (!contentText || contentText.includes("I cannot provide information about future events")) {
          throw new Error('Invalid content generated');
        }

        // Check word count early
        const initialWordCount = contentText.split(/\s+/).length;
        if (initialWordCount < 400) {
          // If too short, try again with more emphasis on length
          const retryPrompt = `${contentPrompt}\n\nIMPORTANT: The previous response was too short at ${initialWordCount} words. Please ensure the content is AT LEAST 400 words by providing more detailed explanations, examples, and analysis in each section.`;
          
          const retryResult = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: retryPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: 2048,
            },
          });
          
          const retryText = retryResult.response.text();
          if (!retryText || retryText.includes("I cannot provide information about future events")) {
            throw new Error('Invalid content generated on retry');
          }
          contentText = retryText;
        }
        
        // Structure the content
        const structurePrompt = `Given this blog post content, create a structured JSON object.
Format the response as a clean JSON object without any markdown code blocks or extra text.
The JSON should have this exact structure:

{
  "title": "The exact title from the content",
  "summary": "A brief summary of the content (first paragraph)",
  "content": "The complete blog post content with all formatting preserved",
  "tags": ["breed-specific", "dog-care", "pet-products"],
  "sections": [
    {
      "title": "Introduction",
      "content": "Introduction content here"
    },
    {
      "title": "Current Trends and Analysis",
      "content": "Trends content here"
    },
    {
      "title": "Practical Insights",
      "content": "Insights content here"
    },
    {
      "title": "Conclusion",
      "content": "Conclusion content here"
    }
  ],
  "references": ["List of research citations"],
  "word_count": 400
}`;

        try {
          // Generate the structure with strict parameters
          const structureResult = await model.generateContent({
            contents: [
              { role: 'user', parts: [{ text: contentText }] },
              { role: 'user', parts: [{ text: structurePrompt }] }
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
              topP: 0.1,
              maxOutputTokens: 4096,
            },
          });

          const structureText = structureResult.response.text();
          console.log('Structure response:', structureText);

          // Extract JSON more carefully
          let jsonText = structureText;
          
          // Remove any markdown code block markers and surrounding text
          jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*$/g, '');
          
          // Find the actual JSON object
          const startIndex = jsonText.indexOf('{');
          const endIndex = jsonText.lastIndexOf('}') + 1;
          
          if (startIndex === -1 || endIndex <= startIndex) {
            throw new Error('No valid JSON object found in response');
          }
          
          jsonText = jsonText.slice(startIndex, endIndex);

          // Clean up the JSON text
          jsonText = jsonText
            .replace(/\n/g, ' ')
            .replace(/\r/g, '')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/"\s+"/g, '","')
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/([{,])\s*"(\w+)":/g, '$1"$2":')
            .trim();

          let blogPost;
          try {
            blogPost = JSON.parse(jsonText);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // Create a basic structure from the content
            const lines = contentText.split('\n');
            const sections = [];
            let currentSection = null;

            lines.forEach(line => {
              if (line.startsWith('#')) {
                if (currentSection) {
                  sections.push(currentSection);
                }
                currentSection = {
                  title: line.replace(/^#+\s*/, '').trim(),
                  content: ''
                };
              } else if (currentSection) {
                currentSection.content += line + '\n';
              }
            });

            if (currentSection) {
              sections.push(currentSection);
            }

            blogPost = {
              title: modifiedTopic,
              summary: lines.slice(1, 3).join(' ').trim(),
              content: contentText,
              tags: ['dog-breeds', 'pet-care', 'dog-training'],
              sections: sections,
              references: [],
              word_count: contentText.split(/\s+/).length
            };
          }

          // Validate and clean up the blog post structure
          if (!blogPost || typeof blogPost !== 'object') {
            throw new Error('Invalid blog structure generated');
          }

          // Ensure all required fields exist with defaults
          const defaults = {
            title: modifiedTopic,
            summary: '',
            content: contentText,
            tags: ['dog-care'],
            sections: [],
            references: [],
            word_count: contentText.split(/\s+/).length
          };

          blogPost = { ...defaults, ...blogPost };

          // Ensure arrays are arrays
          ['tags', 'sections', 'references'].forEach(field => {
            if (!Array.isArray(blogPost[field])) {
              blogPost[field] = defaults[field];
            }
          });

          // If no sections were parsed, create them from the content
          if (blogPost.sections.length === 0) {
            const contentParts = contentText.split(/(?=^#+ )/m);
            blogPost.sections = contentParts.map(part => {
              const lines = part.trim().split('\n');
              return {
                title: lines[0].replace(/^#+\s*/, '').trim(),
                content: lines.slice(1).join('\n').trim()
              };
            }).filter(section => section.title && section.content);
          }

          // Build the final blog post
          return {
            title: blogPost.title,
            slug: blogPost.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim(),
            summary: blogPost.summary,
            content: contentText,
            tags: blogPost.tags,
            imageAlt: `Blog post about ${modifiedTopic}`,
            metaDescription: blogPost.summary,
            sections: blogPost.sections,
            author: {
              name: "PawPedia Team",
              bio: "Expert in dog care and training"
            },
            readingTime: `${Math.ceil(blogPost.word_count / 200)} min read`,
            wordCount: blogPost.word_count,
            references: blogPost.references,
            productRecommendations: formattedProducts.map(p => ({
              ...p,
              context: `Recommended product for ${modifiedTopic.toLowerCase()}`
            }))
          };
        } catch (error) {
          console.error('Error in structure generation:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error generating blog post:', error);
        throw error;
      }
    };

    return await retryOperation(operation);
  }
}; 