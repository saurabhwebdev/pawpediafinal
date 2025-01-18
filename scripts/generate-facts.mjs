import { firebaseService } from '../src/services/firebase.js';
import { geminiService } from '../src/services/geminiAI.js';

const TOTAL_FACTS = 50;

async function generateAndCacheFacts() {
  console.log('Starting dog facts generation...');
  
  try {
    // Generate initial facts
    const facts = await geminiService.generateDogFacts(TOTAL_FACTS);
    
    if (!facts || facts.length === 0) {
      throw new Error('No facts were generated');
    }

    console.log(`Generated ${facts.length} facts`);
    
    // Save all facts
    await firebaseService.setCachedData('facts', 'dog_facts', {
      content: facts,
      timestamp: Date.now()
    });
    console.log('Saved facts list to Firebase');
    
    // Generate and save details for each fact
    for (let i = 0; i < facts.length; i++) {
      const fact = facts[i];
      console.log(`Processing fact ${i + 1}/${facts.length}`);
      
      try {
        const factDetails = await geminiService.generateDogFactDetails(fact);
        if (!factDetails) continue;

        // Save individual fact details
        await firebaseService.setCachedData('fact_details', `fact-${i + 1}`, {
          content: factDetails,
          timestamp: Date.now()
        });
        console.log(`Saved details for fact ${i + 1}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing fact ${i + 1}:`, error);
        continue;
      }
    }
    
    console.log('Facts generation and Firebase upload completed!');
  } catch (error) {
    console.error('Error in facts generation:', error);
    throw error;
  }
}

// Execute the generation
generateAndCacheFacts().catch(console.error); 