from flask import Flask, render_template, request
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
model = SentenceTransformer('all-mpnet-base-v2')  # modello piccolo e veloce

@app.route("/", methods=["GET", "POST"])
def index():
    similarity = None
    if request.method == "POST":
        text1 = request.form["text1"]
        text2 = request.form["text2"]

        # Genera embeddings semantici
        embeddings = model.encode([text1, text2], convert_to_tensor=True)

        # Calcola cosine similarity
        similarity_score = util.cos_sim(embeddings[0], embeddings[1])
        similarity = round(similarity_score.item(), 4)

    return render_template("index.html", similarity=similarity)

if __name__ == "__main__":
    app.run(debug=True)
