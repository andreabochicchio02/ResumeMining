# Resume Classification and Matching System

## Project Overview

This project goes beyond basic classification by integrating advanced NLP techniques, rigorous model evaluation, and an interactive user interface. Below are the main components and innovations included in the system, as detailed in the accompanying academic report.

### Resume Classification

Resumes are automatically classified into one of 24 professional job categories (e.g., IT, Healthcare, HR). After extensive experimentation with various machine learning models and text embeddings, the best-performing configuration was a **Support Vector Machine (SVM) trained on Sentence-BERT (SBERT)** embeddings, achieving **76% accuracy** on an independent test set.

### Resume–Job Description Matching

Given a job description, the system identifies the **top 5 most relevant resumes** based on **semantic similarity using SBERT and cosine similarity**. This module was validated against LLM-based human-like assessments (via Gemini), confirming the system's practical alignment with "human evaluation".

### Text Representation & Model Evaluation

Four feature extraction methods were tested: **TF-IDF, Word2Vec, Doc2Vec, and Sentence-BERT**. These were combined with **Logistic Regression, Random Forest, and Support Vector Machine** classifiers. Extensive **grid search**, **5-fold stratified cross-validation**, and **SMOTE** were applied to address class imbalance. **Wilcoxon signed-rank tests** were used to assess statistical significance among model performances.

### Explainability with SHAP

To interpret model predictions, **SHAP (SHapley Additive Explanations)** was used. These techniques help reveal the most influential words contributing to classification decisions, even when using dense embeddings like SBERT.

### Web-Based User Interface

A user-friendly GUI built with **Flask (Python)** and **HTML/CSS/JavaScript** offers two main functionalities:

* **Resume Classification Page**: Users can paste or upload a resume (PDF) and receive the top 3 predicted job categories.
* **Job Description Matching Page**: Recruiters can input a job description and retrieve the top 5 matching resumes from the database.

---

## Installation

To run this project, you need to install all the required Python packages. All dependencies are listed in the `requirements.txt` file.

> **Note**: This project was developed and tested using **Python 3.11**. It is strongly recommended to use this version to ensure compatibility and reproducibility.

The `requirements.txt` file was generated using:

```bash
pip freeze > requirements.txt
````

### Steps to install dependencies

1. **Clone the repository**:

   ```bash
   git clone https://github.com/andreabochicchio02/ResumeClassification.git
   cd ResumeMining

2. **(Optional) Create and activate a virtual environment**:
    You can use either a standard Python `venv` or a Conda environment to isolate dependencies and avoid conflicts with other projects.

3. **Install all dependencies**:

   ```bash
   pip install -r requirements.txt

Now you're ready to run the project!

---

## License

This project is licensed under the [MIT License](LICENSE).