import feedparser
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans

# Step 1: Get news from RSS (no API key required)
rss_url = "https://feeds.bbci.co.uk/news/rss.xml"
feed = feedparser.parse(rss_url)

# Collect top 5 articles
articles = [entry.summary for entry in feed.entries[:5]]
print("Original Articles:\n")
for art in articles:
    print(art, "\n")

# Step 2: Summarize articles
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
summaries = []
for art in articles:
    try:
        summary = summarizer(art, max_length=80, min_length=30, do_sample=False)
        summaries.append(summary[0]['summary_text'])
    except Exception as e:
        summaries.append("Error summarizing: " + str(e))

print("\nSummaries:\n")
for s in summaries:
    print(s, "\n")

# Step 3: Sentence-BERT encoding
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(summaries)

# Step 4: Clustering (you can change n_clusters based on needs)
num_clusters = 2
kmeans = KMeans(n_clusters=num_clusters, random_state=0).fit(embeddings)

# Step 5: Show clustered summaries
print("\n== Clustered Summaries ==\n")
for i, (summary, label) in enumerate(zip(summaries, kmeans.labels_)):
    print(f"Cluster {label} → Article {i+1}:\n{summary}\n")
