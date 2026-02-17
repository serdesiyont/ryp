import type { Review, University } from "@/components/home/types";

export const topUniversities: University[] = [
  { name: "Addis Ababa University", rating: "4.8", reviews: "2.4k reviews" },
  { name: "Jimma University", rating: "4.6", reviews: "1.8k reviews" },
  { name: "Bahir Dar University", rating: "4.5", reviews: "1.2k reviews" },
  { name: "Mekelle University", rating: "4.4", reviews: "950 reviews" },
];

export const latestReviews: Review[] = [
  {
    title: "Dr. Yohannes Tadesse",
    subtitle: "Department of Computer Science, AAU",
    rating: 5,
    content:
      "Excellent professor with deep knowledge of algorithms. His lectures are engaging and he always provides real-world examples that make complex concepts easy to understand.",
    author: "Amsalu S.",
    time: "2 hours ago",
  },
  {
    title: "Dr. Helina Bekele",
    subtitle: "Faculty of Medicine, Jimma University",
    rating: 4,
    content:
      "Very strict but fair. You will learn a lot in her anatomy class if you put in the work. Highly recommended for students who are serious about their medical career.",
    author: "Marta K.",
    time: "5 hours ago",
  },
  {
    title: "Addis Ababa University",
    subtitle: "General Campus Life",
    rating: 5,
    content:
      "The library facilities have improved significantly over the past year. Great atmosphere for research and group study.",
    author: "Biniam T.",
    time: "1 day ago",
  },
];
