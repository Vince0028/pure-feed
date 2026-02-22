import os
import time
import requests
import json
from bs4 import BeautifulSoup

# Keys hardcoded for one-off throwaway script execution
SUPABASE_URL = "https://dobzgwvujlshsrklrdhr.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def fetch_missing_posts():
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    url = f"{SUPABASE_URL}/rest/v1/posts?select=id,title,sourceId,url&contentType=eq.article&snippet=is.null"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    print("Failed to fetch posts:", response.text)
    return []

def scrape_content(url):
    try:
        res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        soup = BeautifulSoup(res.text, 'html.parser')
        for script in soup(["script", "style", "noscript", "svg", "img"]):
            script.extract()
        text = soup.get_text(separator=' ')
        return " ".join(text.split())[:5000]
    except Exception as e:
        return None

def summarize(content):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "user",
                "content": f"Summarize this text into a single cohesive paragraph (max 3 sentences) explaining what this article is about. Focus on the core value or main announcement. Do NOT use bullet points or introductory filler phrases. Text: {content}"
            }
        ],
        "temperature": 0.3
    }
    try:
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=20)
        return res.json()['choices'][0]['message']['content'].strip()
    except Exception as e:
        print("Groq error:", e)
        return None

def update_db(post_id, snippet):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    url = f"{SUPABASE_URL}/rest/v1/posts?id=eq.{post_id}"
    res = requests.patch(url, headers=headers, json={"snippet": snippet})
    return res.status_code

def backfill():
    posts = fetch_missing_posts()
    print(f"Found {len(posts)} articles with NULL snippets.")
    
    for i, post in enumerate(posts):
        print(f"[{i+1}/{len(posts)}] Processing: {post.get('title')}")
        
        target_url = post.get('sourceId') if post.get('sourceId') and post.get('sourceId').startswith('http') else post.get('url')
        if not target_url or not target_url.startswith('http'):
            print("   -> Invalid URL, skipping.")
            continue
            
        content = scrape_content(target_url)
        if not content or len(content) < 50:
            print("   -> Failed to scrape enough text.")
            continue
            
        snippet = summarize(content)
        if snippet:
            status = update_db(post.get('id'), snippet)
            if status == 204:
                print("   -> Saved snippet successfully!")
            else:
                print(f"   -> Failed to save. Status: {status}")
        
        time.sleep(1.5)

if __name__ == "__main__":
    backfill()
