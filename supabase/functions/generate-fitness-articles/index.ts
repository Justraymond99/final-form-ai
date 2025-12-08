import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  readTime: number;
  tags: string[];
  author: string;
  publishedAt: string;
}

const articleCategories = [
  'Nutrition Tips',
  'Workout Guides',
  'Recovery & Rest',
  'Mental Health',
  'Weight Loss',
  'Muscle Building',
  'Cardio Training',
  'Strength Training',
  'Flexibility & Mobility',
  'Healthy Habits'
];

const fitnessTopics = [
  'the importance of protein timing for muscle growth',
  'how to create an effective home workout routine',
  'the science behind HIIT training and fat loss',
  'understanding macronutrients for body composition',
  'recovery strategies for better workout performance',
  'building sustainable healthy eating habits',
  'the role of sleep in fitness and weight management',
  'progressive overload principles for strength gains',
  'hydration strategies for optimal performance',
  'managing stress for better fitness results',
  'meal prep strategies for busy lifestyles',
  'the benefits of compound exercises vs isolation',
  'understanding metabolism and calorie burning',
  'flexibility and mobility for injury prevention',
  'setting and achieving realistic fitness goals'
];

// Verify authentication
async function verifyAuth(req: Request): Promise<{ userId: string | null; error: string | null }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { userId: null, error: 'Missing authorization header' };
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
      return { userId: null, error: 'Invalid or expired token' };
    }

    return { userId: user.id, error: null };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { userId: null, error: 'Authentication failed' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const { userId, error: authError } = await verifyAuth(req);
    if (authError || !userId) {
      console.warn('Unauthorized generate-fitness-articles request:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { topic, category, count = 6 } = await req.json();
    console.log(`User ${userId} generating articles with params:`, { topic, category, count });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const articles: Article[] = [];

    for (let i = 0; i < count; i++) {
      const selectedTopic = topic || fitnessTopics[Math.floor(Math.random() * fitnessTopics.length)];
      const selectedCategory = category || articleCategories[Math.floor(Math.random() * articleCategories.length)];
      
      const article = await generateSingleArticle(selectedTopic, selectedCategory);
      if (article) {
        articles.push(article);
      }
    }

    console.log(`Successfully generated ${articles.length} articles`);

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating articles:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate articles', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateSingleArticle(topic: string, category: string): Promise<Article | null> {
  try {
    const prompt = `Write a comprehensive fitness article about "${topic}" in the "${category}" category. 

Requirements:
- Write 800-1200 words
- Include practical, actionable advice
- Use a friendly but professional tone
- Structure with clear headings and bullet points
- Include scientific backing where relevant
- Make it engaging and easy to read
- Focus on helping people achieve their fitness goals

Format the response as a well-structured article with an engaging title.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a certified fitness expert and nutritionist who writes engaging, evidence-based articles for a fitness app. Your articles should be practical, motivating, and accessible to people of all fitness levels.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('No content generated');
      return null;
    }

    // Extract title from content (assuming it's the first line)
    const lines = content.split('\n').filter(line => line.trim());
    const title = lines[0].replace(/^#\s*/, '').trim();
    const articleContent = lines.slice(1).join('\n').trim();

    // Generate excerpt (first 150 characters of content)
    const excerpt = articleContent.replace(/[#*]/g, '').substring(0, 150) + '...';

    // Estimate read time (average 200 words per minute)
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / 200);

    // Generate relevant tags
    const tags = generateTags(topic, category);

    const article: Article = {
      id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || `${category}: ${topic}`,
      category,
      content: articleContent,
      excerpt,
      readTime,
      tags,
      author: 'Final Form AI',
      publishedAt: new Date().toISOString(),
    };

    return article;

  } catch (error) {
    console.error('Error generating single article:', error);
    return null;
  }
}

function generateTags(topic: string, category: string): string[] {
  const topicTags = topic.toLowerCase().split(' ').slice(0, 3);
  const categoryTag = category.toLowerCase().replace(' & ', ' ').replace(' ', '-');
  
  const commonTags = ['fitness', 'health', 'wellness', 'training', 'nutrition'];
  const relevantCommonTags = commonTags.filter(tag => 
    topic.toLowerCase().includes(tag) || category.toLowerCase().includes(tag)
  );

  return [...topicTags, categoryTag, ...relevantCommonTags.slice(0, 2)];
}
