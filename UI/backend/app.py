import os
import PyPDF2
import joblib
import pandas as pd
from flask import Flask, render_template, request, jsonify, send_file, abort
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from io import BytesIO

# Load pre-trained model
model_loaded = joblib.load('../../Models/lr_sbert_pipeline.joblib')

label_encoder = joblib.load('../../Models/label_encoder.joblib')

# Initialize SBERT model for embeddings
sbert_model = SentenceTransformer('all-MiniLM-L12-v2')

# Read processed resumes data
df_resumes = pd.read_csv('../../PreProcessingResumes/processed_data/Resumes.csv')
df_jobs = pd.read_csv('../../PreProcessingJobs/processed_data/JobDescription.csv')

# Load pre-computed resume embeddings
resumes_embed = joblib.load('../../Models/resumes_embeddings.joblib')

# Create Flask application
app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

@app.route("/")
def index():
    # Render home page
    return render_template("index.html")

# MATCHING SYSTEM

@app.route("/get-job-description/<int:job_id>")
def get_job_description(job_id):
    try:
        job_description = df_jobs[df_jobs['job_id'] == job_id].iloc[0]['description'] 
        return jsonify({"description": job_description})
    except IndexError:
        return jsonify({"error": "Job ID not found"}), 404


@app.route("/jobResumeMatch", methods=["POST"])
def jobResumeMatch():
    # Get JSON payload with job description text
    data = request.get_json()
    job_text = data.get("text", "")

    # Encode job description and compute cosine similarity against resumes
    job_embed = sbert_model.encode([job_text], show_progress_bar=False)
    similarity_vector = cosine_similarity(job_embed, resumes_embed).flatten()

    # Select top 5 matching resumes
    top_indices = similarity_vector.argsort()[::-1][:5]

    # Prepare JSON response with match details
    results = []
    for rank, idx in enumerate(top_indices, start=1):
        results.append({
            'cv_id':    int(df_resumes.iloc[idx]['ID']),  
            'category': df_resumes.iloc[idx]['Category'],  
            'score':    float(similarity_vector[idx]),     
            'rank':     rank
        })

    return jsonify({"similarity": results})

@app.route('/download-cv/<category>/<cv_id>')
def download_cv(category, cv_id):
    file_path = os.path.join('../../dataset/Resumes/PDF', category, f'{cv_id}.pdf')

    # Send file if exists, else return 404
    if os.path.isfile(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        abort(404)


# CLASSIFICATION

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
    

    resumes_embed = sbert_model.encode([text], show_progress_bar=False)

    probabilities = model_loaded.predict_proba(resumes_embed)[0]

    classes = label_encoder.inverse_transform(model_loaded.classes_).tolist()
    class_probs = list(zip(classes, probabilities))

    class_probs_sorted = sorted(class_probs, key=lambda x: x[1], reverse=True)

    top_3 = class_probs_sorted[:3]

    top_predictions = []

    for i, (cat, prob) in enumerate(top_3):
        top_predictions.append({
            'rank':         i+1,
            'category':     cat,
            'score':        prob
        })

    return jsonify({"top_predictions": top_predictions})

if __name__ == "__main__":
    app.run(debug=True)