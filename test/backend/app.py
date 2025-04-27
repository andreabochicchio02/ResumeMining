from flask import Flask, render_template, request, jsonify
from sentence_transformers import SentenceTransformer
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

sbert_model = SentenceTransformer('all-MiniLM-L12-v2')
df_resumes = pd.read_csv('../../PreProcessing/processed_data/Resume_proc_lemm.csv')
resumes = df_resumes["Resume_str"].tolist()
cat = df_resumes["Category"].astype("category")
labels = cat.cat.codes
category_names = list(cat.cat.categories)
resumes_embed = sbert_model.encode(df_resumes['Resume_str'], show_progress_bar=True)

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

@app.route("/")
def index():
    # renderizza test/templates/index.html
    return render_template("index.html")

@app.route("/jobResumeMatch", methods=["POST"])
def jobResumeMatch():
    dati = request.get_json()
    job_sample = dati.get("text", "")

    job_embed = sbert_model.encode([job_sample], show_progress_bar=False)
    similarity_vector = cosine_similarity(job_embed, resumes_embed).flatten()

    top_matches = similarity_vector.argsort()[::-1][:5]

    results = []
    for rank, cv_idx in enumerate(top_matches, start=1):
        cv_real_id   = df_resumes.iloc[cv_idx]['ID']
        cv_category  = df_resumes.iloc[cv_idx]['Category']
        score        = similarity_vector[cv_idx]
        
        results.append({
            'cv_id':            int(cv_real_id),
            'cv_category':      cv_category,
            'similarity_score': float(score),
            'rank':             rank
        })

    return jsonify({"similarity": results})

if __name__ == "__main__":
    app.run(debug=True)