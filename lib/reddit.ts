/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  subreddit: string;
  url: string;
  num_comments: number;
  created_utc: number;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  permalink: string;
  created_utc: number;
}

export const fetchSubredditPosts = async (subreddit: string, keyword: string, limit = 25, time: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'all'): Promise<RedditPost[]> => {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=relevance&limit=${limit}&t=${time}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.37 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.37',
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.children.map((child: { data: RedditPost }) => child.data);
  } catch (error) {
    console.error(`Error fetching posts from r/${subreddit}:`, error);
    return [];
  }
};

export const fetchComments = async (postId: string, subreddit: string): Promise<RedditComment[]> => {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const commentNodes = data[1].data.children;
    
    const extractReplies = (replies: { data?: { children?: any[] } }): RedditComment[] => {
      if (!replies || !replies.data || !replies.data.children) return [];
      
      return replies.data.children.flatMap((child: { kind: string, data: any }) => {
        if (child.kind !== 't1') return [];
        const comment = child.data;
        return [
          comment,
          ...extractReplies(comment.replies)
        ];
      });
    };

    return commentNodes.flatMap((child: { kind: string, data: any }) => {
      if (child.kind !== 't1') return [];
      const comment = child.data;
      return [
        comment,
        ...extractReplies(comment.replies)
      ];
    });
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
};
