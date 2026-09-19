"""
Melatih model klasifikasi fault DGA transformator.

Sumber label: DGA-dataset-1.csv (dataset akademik publik dengan label fault-type
yang ditentukan independen dari kode ini). DATASET_RIIL_22-25.csv SENGAJA TIDAK
dipakai untuk melatih model ini karena kolom 'Label_Diagnosa'-nya berisi
"Kondisi 1..4" -- itu adalah level keparahan TDCG (severity), bukan jenis fault,
dan skema labelnya tidak sebanding dengan Fault_Type di dataset akademik.
Mencampur keduanya akan merusak ruang kelas target.

Model hanya memakai 5 fitur gas (H2, CH4, C2H6, C2H4, C2H2) karena itulah fitur
yang tersedia di dataset berlabel independen. CO/CO2/TDCG tidak dipakai di sini;
kondisi berbasis TDCG/CO2 sudah dihitung terpisah lewat rule engine di main.py
(analisis_spln, analisis_ratio_co2_co), yang tidak butuh model ML sama sekali.
"""
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

FEATURES = ["H2", "CH4", "C2H6", "C2H4", "C2H2"]
MODEL_PATH = "smart_dga_model_keygas.pkl"

df = pd.read_csv("DGA-dataset-1.csv")
df = df.rename(columns={"Type": "Fault_Type"})
df = df[FEATURES + ["Fault_Type"]].dropna()

X = df[FEATURES]
y = df["Fault_Type"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=200, random_state=42, class_weight="balanced"
)
model.fit(X_train, y_train)

# Cross-validation di seluruh dataset agar estimasi akurasi lebih stabil
# daripada satu kali split (dataset hanya 201 baris).
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X, y, cv=cv)

y_pred = model.predict(X_test)

print(f"Akurasi pada test split (20%): {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(f"Akurasi cross-validation (5-fold, rata-rata): {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")
print("\nClassification report (test split):")
print(classification_report(y_test, y_pred, zero_division=0))
print("\nConfusion matrix (test split):")
print(pd.DataFrame(
    confusion_matrix(y_test, y_pred, labels=sorted(y.unique())),
    index=sorted(y.unique()), columns=sorted(y.unique()),
))

import joblib
joblib.dump(model, MODEL_PATH)
print(f"\nModel disimpan ke {MODEL_PATH} (fitur: {FEATURES})")
