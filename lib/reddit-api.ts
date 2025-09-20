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
        title: "The Future of AI Development: Balancing Innovation with Ethics",
        summary: "A comprehensive discussion examining the current state of AI development and its trajectory. The Reddit community explores both the transformative opportunities and significant challenges facing developers, with particular emphasis on ethical AI development, bias mitigation, and the balance between automation and human creativity in programming.",
        viewpoints: [
          "AI will revolutionize software development by automating routine coding tasks and accelerating development cycles",
          "Human creativity, critical thinking, and ethical judgment remain irreplaceable in programming", 
          "The key is finding the right balance between AI assistance and human expertise to enhance rather than replace developers",
          "Ethical AI development requires transparent algorithms, bias mitigation, and inclusive development practices",
          "Open-source AI tools democratize development but raise concerns about code quality and security"
        ]
      },
      {
        title: "Climate Solutions: The Great Technology vs. Policy Debate",
        summary: "An in-depth Reddit discussion analyzing various approaches to addressing climate change. The community examines the ongoing debate between technological innovation and policy interventions, covering renewable energy breakthroughs, carbon capture technologies, nuclear power, and the critical role of government regulation in creating systemic environmental change.",
        viewpoints: [
          "Technological innovation alone can solve climate issues through breakthrough solutions like fusion energy and advanced carbon capture",
          "Policy changes, carbon pricing, and strict regulations are essential for meaningful environmental progress at scale",
          "A combined approach of aggressive policy and technological innovation creates the most effective climate strategy",
          "Individual action and corporate responsibility must complement systemic changes, but can't replace them",
          "Nuclear energy is essential for clean baseload power, despite public concerns about safety"
        ]
      },
      {
        title: "Remote Work Revolution: Redefining the Future of Employment",
        summary: "A comprehensive Reddit discussion exploring how remote work has fundamentally transformed workplace culture post-pandemic. The community examines its multifaceted effects on employee productivity, team collaboration, company culture, mental health, and work-life balance, featuring insights from employees, managers, and business owners across various industries.",
        viewpoints: [
          "Remote work significantly increases productivity, reduces commute stress, and improves work-life balance for most employees",
          "In-person collaboration is essential for creativity, mentorship, and building strong team relationships",
          "Hybrid models offer the optimal balance of remote flexibility and office interaction for different work types",
          "The future of work requires new management approaches, digital collaboration tools, and performance metrics",
          "Remote work creates geographic inequality, with some areas losing talent while others struggle with housing costs"
        ]
      },
      {
        title: "Social Media's Mental Health Crisis: A Generation Under Pressure",
        summary: "A thoughtful Reddit discussion examining the complex relationship between social media usage and mental health, particularly among Gen Z and millennials. The community explores both the benefits of digital connection and community building, alongside the concerning rise in anxiety, depression, and body image issues linked to algorithm-driven social platforms.",
        viewpoints: [
          "Social media creates unrealistic expectations, comparison culture, and FOMO that significantly harm mental health",
          "Digital platforms provide valuable community, support networks, and connection for marginalized groups",
          "Algorithm-driven content feeds are designed to be addictive and exploit psychological vulnerabilities",
          "Digital literacy education and mindful usage practices are key to healthy social media relationships",
          "Platform regulation and design changes are needed to prioritize user wellbeing over engagement metrics"
        ]
      },
      {
        title: "The Global Housing Crisis: Causes, Consequences, and Solutions",
        summary: "An extensive Reddit analysis of the housing affordability crisis affecting major cities worldwide. The discussion covers the complex interplay of factors including rising prices, supply shortages, investment speculation, zoning restrictions, and various proposed solutions ranging from zoning reform and rent control to social housing programs and speculation taxes.",
        viewpoints: [
          "Restrictive zoning laws, NIMBY policies, and excessive regulations artificially limit housing supply and drive up costs",
          "Investment speculation, corporate ownership, and treating housing as a commodity drive up prices unfairly",
          "Government intervention through rent control, social housing, and tenant protections is necessary to ensure affordability",
          "Market-based solutions, streamlined permitting, and massive construction increases are the only long-term answer",
          "The crisis requires coordinated policy addressing supply, speculation, wages, and urban planning simultaneously"
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