import { SummaryResponse } from './types';

// Mock Reddit API - simulates processing Reddit URLs
export class RedditAPI {
  static async summarizePost(redditUrl: string): Promise<SummaryResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extract post ID from URL for more realistic mock data
    const postId = this.extractPostId(redditUrl);
    
    // Mock responses based on common Reddit topics
    const mockResponses: SummaryResponse[] = [
      {
        title: "The Future of AI Development: Opportunities and Challenges",
        summary: "A comprehensive discussion about the current state and future potential of artificial intelligence development. The conversation explores both the exciting opportunities and significant challenges facing developers in the rapidly evolving AI space, with particular focus on ethical considerations and practical implementation.",
        viewpoints: [
          "AI will revolutionize software development by automating routine coding tasks",
          "Human creativity and problem-solving remain irreplaceable in programming", 
          "The key is finding the right balance between AI assistance and human expertise",
          "Ethical AI development requires careful consideration of bias and transparency"
        ]
      },
      {
        title: "Climate Change Solutions: Technology vs. Policy Debate",
        summary: "An in-depth analysis of various approaches to addressing climate change, examining the ongoing debate between technological innovation and policy interventions. The discussion covers renewable energy, carbon capture, and the role of government regulation in creating meaningful environmental impact.",
        viewpoints: [
          "Technological innovation alone can solve climate issues through breakthrough solutions",
          "Policy changes and regulations are essential for meaningful environmental progress",
          "A combined approach of technology and policy creates the most effective climate strategy",
          "Individual action and corporate responsibility must complement systemic changes"
        ]
      },
      {
        title: "Remote Work Revolution: Productivity, Culture, and Work-Life Balance",
        summary: "A detailed exploration of how remote work has fundamentally transformed workplace culture since the pandemic. The discussion examines its effects on employee productivity, team collaboration, company culture, and personal well-being, with insights from both employees and managers.",
        viewpoints: [
          "Remote work significantly increases productivity and employee satisfaction",
          "In-person collaboration is essential for creativity and team building",
          "Hybrid models offer the best of both remote flexibility and office interaction",
          "The future of work requires new management approaches and digital tools"
        ]
      },
      {
        title: "Social Media's Impact on Mental Health: A Generation's Struggle",
        summary: "A thoughtful discussion about the complex relationship between social media usage and mental health, particularly among younger generations. The conversation explores both the benefits of digital connection and the concerning rise in anxiety and depression linked to social platforms.",
        viewpoints: [
          "Social media creates unrealistic expectations and comparison culture",
          "Digital platforms provide valuable community and support networks",
          "The algorithm-driven content feeds contribute to addictive behaviors",
          "Education and digital literacy are key to healthy social media use"
        ]
      },
      {
        title: "The Housing Crisis: Causes, Effects, and Potential Solutions",
        summary: "An extensive analysis of the current housing affordability crisis affecting major cities worldwide. The discussion covers rising prices, supply shortages, investment speculation, and various proposed solutions from zoning reform to rent control policies.",
        viewpoints: [
          "Restrictive zoning laws and regulations limit housing supply artificially",
          "Investment speculation and corporate ownership drive up prices unfairly",
          "Government intervention through rent control and subsidies is necessary",
          "Market-based solutions and increased construction are the long-term answer"
        ]
      }
    ];
    
    // Return a mock response (cycle through them based on URL)
    const index = Math.abs(postId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % mockResponses.length;
    return mockResponses[index];
  }
  
  private static extractPostId(url: string): string {
    // Extract post ID from Reddit URL
    const match = url.match(/\/comments\/([a-zA-Z0-9]+)/);
    return match ? match[1] : 'default';
  }
  
  static isValidRedditUrl(url: string): boolean {
    const redditPattern = /^https?:\/\/(www\.)?reddit\.com\/r\/[\w\d_]+\/comments\/[\w\d]+/;
    return redditPattern.test(url);
  }
}