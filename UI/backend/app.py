from flask import Flask, render_template, request, jsonify, send_file, abort
from sentence_transformers import SentenceTransformer
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os
import PyPDF2
from io import BytesIO

sbert_model = SentenceTransformer('all-MiniLM-L12-v2')
df_resumes = pd.read_csv('../../PreProcessingResumes/processed_data/Resume_proc_lemm.csv')
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
def job_resume_match():
    if 'file' in request.files: 
        file = request.files['file']
        if file.filename.endswith('.pdf'):
            file_stream = BytesIO(file.read())
            extracted_text = extract_text_from_pdf(file_stream)
            return jsonify({'text': extracted_text})
        else:
            return jsonify({'error': 'Only PDF files are allowed'}), 400
    elif 'text' in request.json:
        text = request.json['text']
        return jsonify({'text': text})
    else:
        return jsonify({'error': 'Please provide either text or a PDF file'}), 400

if __name__ == "__main__":
    app.run(debug=True)