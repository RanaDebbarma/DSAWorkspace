import { runClassTests } from "#functions/code-tester.js";

// LeetCode 355

type Post = { postId: number; time: number };
type UserProfile = {
  userId: number;
  followings: Set<number>;
  posts: Post[];
};

class Twitter {
  users = new Map<number, UserProfile>();
  globalTime: number = 0;

  private createUser(userId: number) {
    this.users.set(userId, {
      userId,
      followings: new Set<number>(),
      posts: [],
    });
  }

  postTweet(userId: number, tweetId: number): void {
    if (!this.users.has(userId)) {
      this.createUser(userId);
    }

    const userPosts = this.users.get(userId)!.posts;

    userPosts.push({
      postId: tweetId,
      time: ++this.globalTime,
    });
  }
  getNewsFeed(userId: number): number[] {
    const user = this.users.get(userId);

    if (!user) return [];

    const feed = new Heap<Post>((a, b) => b.time - a.time);
    const newsFeed: number[] = [];

    addPostsToFeed(user.posts);

    for (const followeeId of user.followings) {
      const followeePosts = this.users.get(followeeId)!.posts;
      addPostsToFeed(followeePosts);
    }

    while (feed.size && newsFeed.length < 10) {
      newsFeed.push(feed.pop()!.postId);
    }

    return newsFeed;

    function addPostsToFeed(posts: Post[]): void {
      const n = posts.length;
      const start = Math.max(0, n - 10);
      for (let i = n - 1; i >= start; i--) {
        feed.push(posts[i]);
      }
    }
  }
  follow(followerId: number, followeeId: number): void {
    if (!this.users.has(followerId)) {
      this.createUser(followerId);
    }

    if (!this.users.has(followeeId)) {
      this.createUser(followeeId);
    }

    const follower = this.users.get(followerId)!;

    follower.followings.add(followeeId);
  }
  unfollow(followerId: number, followeeId: number): void {
    const follower = this.users.get(followerId);
    const followee = this.users.get(followeeId);

    if (!follower || !followee) return;

    follower.followings.delete(followee.userId);
  }
}

class Heap<T = number> {
  h: T[] = [];
  constructor(
    private c: (a: T, b: T) => number = (a: any, b: any) => a - b,
    init?: T[],
  ) {
    if (init) {
      this.h = [...init];
      for (let i = (this.h.length >> 1) - 1; i >= 0; i--) this.down(i);
    }
  }
  push(v: T) {
    this.h.push(v);
    this.up(this.h.length - 1);
  }
  pop(): T | undefined {
    if (!this.h.length) return undefined;
    const top = this.h[0],
      bot = this.h.pop()!;
    if (this.h.length) {
      this.h[0] = bot;
      this.down(0);
    }
    return top;
  }
  peek(): T | undefined {
    return this.h[0];
  }
  get size(): number {
    return this.h.length;
  }
  isEmpty(): boolean {
    return this.h.length === 0;
  }
  private up(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.c(this.h[i], this.h[p]) < 0) {
        [this.h[i], this.h[p]] = [this.h[p], this.h[i]];
        i = p;
      } else break;
    }
  }
  private down(i: number) {
    const n = this.h.length;
    while ((i << 1) + 1 < n) {
      let b = (i << 1) + 1,
        r = b + 1;
      if (r < n && this.c(this.h[r], this.h[b]) < 0) b = r;
      if (this.c(this.h[b], this.h[i]) < 0) {
        [this.h[i], this.h[b]] = [this.h[b], this.h[i]];
        i = b;
      } else break;
    }
  }
}

runClassTests(Twitter, [
  {
    operations: [
      "Twitter",
      "postTweet",
      "postTweet",
      "getNewsFeed",
      "getNewsFeed",
      "follow",
      "getNewsFeed",
      "getNewsFeed",
      "unfollow",
      "getNewsFeed",
    ],
    args: [[], [1, 10], [2, 20], [1], [2], [1, 2], [1], [2], [1, 2], [1]],
    expected: [null, null, null, [10], [20], null, [20, 10], [20], null, [10]],
  },
  {
    operations: [
      "Twitter",
      "postTweet",
      "getNewsFeed",
      "follow",
      "postTweet",
      "getNewsFeed",
      "unfollow",
      "getNewsFeed",
    ],
    args: [[], [1, 5], [1], [1, 2], [2, 6], [1], [1, 2], [1]],
    expected: [null, null, [5], null, null, [6, 5], null, [5]],
  },
]);
