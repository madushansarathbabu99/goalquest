export const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Setting goals is the first step in turning the invisible into the visible.", author: "Tony Robbins" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "Focus on progress, not perfection.", author: "Anonymous" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Your limitation—it's only your imagination.", author: "Anonymous" },
  { text: "Dream it. Wish it. Do it.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
]

export function getCurrentQuote() {
  // Changes every 6 hours — based on time-of-day block
  const now = new Date()
  const block = Math.floor(now.getHours() / 6) // 0,1,2,3
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  const idx = (dayOfYear * 4 + block) % quotes.length
  return quotes[idx]
}
