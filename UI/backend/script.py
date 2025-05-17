import joblib
from sentence_transformers import SentenceTransformer
import pandas as pd

sbert_model = SentenceTransformer('all-MiniLM-L12-v2')
df_resumes_train = pd.read_csv('../../PreProcessingResumes/processed_data/Resume/train.csv')
df_resumes_test = pd.read_csv('../../PreProcessingResumes/processed_data/Resume/test.csv')

df_resumes = pd.concat([df_resumes_train, df_resumes_test], ignore_index=True)

resumes_embed = sbert_model.encode(df_resumes['Resume_str'], show_progress_bar=True)

joblib.dump(resumes_embed, '../../Models/resumes_embeddings.joblib')
df_resumes.to_csv('../../PreProcessingResumes/processed_data/Resumes.csv', index=False)
