from flask import Flask, render_template, request, jsonify, send_file, abort
from sentence_transformers import SentenceTransformer
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os
import PyPDF2
from io import BytesIO
import joblib

RF_Model_loaded = joblib.load('../../Models/random_forest_best_model.joblib')
tfidf_vect_loaded = joblib.load('../../Models/tfidf_vectorizer.joblib')

sbert_model = SentenceTransformer('all-MiniLM-L12-v2')
df_resumes = pd.read_csv('../../PreProcessingResumes/processed_data/Resumes.csv')

resumes_embed = joblib.load('../../Models/resumes_embeddings.joblib')

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

@app.route("/")
def index():
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
        results.append({
            'cv_id':        int(df_resumes.iloc[cv_idx]['ID']),
            'category':     df_resumes.iloc[cv_idx]['Category'],
            'value':        float(similarity_vector[cv_idx]),
            'rank':         rank
        })

    return jsonify({"similarity": results})

@app.route('/download-cv/<job_name>/<cv_id>')
def download_cv(job_name, cv_id):
    # Pulizia e normalizzazione base
    #safe_job = job_name.replace('..', '').replace('/', '').replace('\\', '').replace(' ', '_')
    #safe_id = cv_id.replace('..', '').replace('/', '').replace('\\', '')

    # Costruzione del path
    file_path = os.path.join('../../dataset/Resumes/PDF', job_name, f'{cv_id}.pdf')

    # Verifica se esiste
    if os.path.isfile(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        abort(404)

def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ''
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        text += page.extract_text()
    return text

@app.route('/resumeClassification', methods=['POST'])
def resume_classification():
    text = ''
    if 'file' in request.files: 
        file = request.files['file']
        if file.filename.endswith('.pdf'):
            file_stream = BytesIO(file.read())
            text = extract_text_from_pdf(file_stream)
        else:
            return jsonify({'error': 'Only PDF files are allowed'}), 400
    elif 'text' in request.json:
        text = request.json['text']
    
    features = tfidf_vect_loaded.transform([text])

    probabilities = RF_Model_loaded.predict_proba(features)[0]

    class_probs = list(zip(RF_Model_loaded.classes_, probabilities))

    class_probs_sorted = sorted(class_probs, key=lambda x: x[1], reverse=True)

    top_3 = class_probs_sorted[:3]

    # Arrotonda le probabilità e costruisci la risposta
    top_predictions = []

    for i, (cat, prob) in enumerate(top_3):
        top_predictions.append({
            'rank':         i+1,
            'category':     cat,
            'value':        prob
        })

    return jsonify({"top_predictions": top_predictions})

if __name__ == "__main__":
    app.run(debug=True)