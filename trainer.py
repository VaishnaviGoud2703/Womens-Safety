"""
Model Trainer for Nirbhaya: A World Without Fear - Threat & Harassment Classifier.
Uses TF-IDF feature extraction combined with a calibrated Logistic Regression model.
"""
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from ml_engine.dataset import TRAINING_DATA

def train_and_save_model(output_path=None):
    if output_path is None:
        base_dir = os.path.dirname(__file__)
        models_dir = os.path.join(base_dir, "models")
        os.makedirs(models_dir, exist_ok=True)
        output_path = os.path.join(models_dir, "threat_classifier.joblib")
    else:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]

    # Pipeline: Sublinear TF-IDF + Balanced Multi-class Logistic Regression
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            lowercase=True,
            strip_accents="unicode",
            sublinear_tf=True,
            min_df=1
        )),
        ("classifier", LogisticRegression(
            C=3.0,
            class_weight="balanced",
            max_iter=1000,
            solver="lbfgs"
        ))
    ])

    pipeline.fit(texts, labels)
    
    # Save trained model pipeline
    joblib.dump(pipeline, output_path)
    print(f"Model successfully trained on {len(texts)} samples and saved to: {output_path}")
    return pipeline

if __name__ == "__main__":
    train_and_save_model()
