const Groq = require('groq-sdk');
const ExpressError = require('./expressError');

// Configuration for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 30000; // 30 seconds

// Simple in-memory cache for successful responses
const cache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function analyseResume(resumeContent, jobUrl) {
    const groq = new Groq({ 
        apiKey: process.env.GROQ_API_KEY,
        timeout: TIMEOUT
    });
    
    // Create cache key
    const cacheKey = `${resumeContent.substring(0, 100)}_${jobUrl.substring(0, 100)}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('Returning cached analysis');
            return cached.data;
        }
    }

    const prompt = `
Compare the following resume with the job posting.

Resume: ${resumeContent.substring(0, 2000)} 
Job Posting: ${jobUrl} 

Return the result ONLY in this exact JSON format:
{
  "score": <number between 0-100>,
  "strengths": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "improvements": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}

Do not add explanations or extra text outside this JSON.
`;

    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const completion = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1000,
                temperature: 0.1,
            });

            const response = completion.choices[0].message.content;
            
            // Cache successful response
            cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });
            
            return response;
            
        } catch (err) {
            lastError = err;
            console.error(`Attempt ${attempt} failed:`, err.message);
            
            // Handle specific error types
            if (err.status === 503 || err.message.includes('Service unavailable')) {
                if (attempt === MAX_RETRIES) {
                    // Return fallback response when service is down
                    const fallbackResponse = JSON.stringify({
                        score: 0,
                        strengths: ["Analysis temporarily unavailable"],
                        improvements: ["Please try again later - AI service is experiencing issues"]
                    });
                    
                    // Cache fallback response for shorter duration
                    cache.set(cacheKey, {
                        data: fallbackResponse,
                        timestamp: Date.now() - (CACHE_DURATION - 5 * 60 * 1000) // 5 minutes
                    });
                    
                    return fallbackResponse;
                }
                
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                
            } else if (err.status === 429 || err.message.includes('rate limit')) {
                // Handle rate limiting
                const retryAfter = err.headers?.['retry-after'] || 15;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                
            } else {
                // For other errors, don't retry
                break;
            }
        }
    }
    
    // If all retries failed, throw a user-friendly error
    console.error('All retry attempts failed:', lastError);
    
    if (lastError.status === 503 || lastError.message.includes('Service unavailable')) {
        throw new ExpressError(
            'AI analysis service is temporarily unavailable. Please try again in a few minutes.',
            503
        );
    } else if (lastError.status === 429) {
        throw new ExpressError(
            'Rate limit exceeded. Please wait a moment and try again.',
            429
        );
    } else {
        throw new ExpressError(
            'Unable to analyze resume at this time. Please try again later.',
            500
        );
    }
}

// Utility function to clear cache (for testing/admin purposes)
function clearCache() {
    cache.clear();
    console.log('Analysis cache cleared');
}

module.exports = { analyseResume, clearCache };
