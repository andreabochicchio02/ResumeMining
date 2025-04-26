from flask import Flask, render_template, request, jsonify
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
model = SentenceTransformer('all-mpnet-base-v2')

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/calcola_similarita", methods=["POST"])
def calcola_similarita():
    dati = request.get_json()
    text1 = dati.get("text1", "")
    text2 = dati.get("text2", "")

    # Genera embeddings
    embeddings = model.encode([text1, text2], convert_to_tensor=True)

    # Calcola cosine similarity
    similarity_score = util.cos_sim(embeddings[0], embeddings[1])
    similarity = round(similarity_score.item(), 4)

    return jsonify({"similarity": similarity})

if __name__ == "__main__":
    app.run(debug=True)
