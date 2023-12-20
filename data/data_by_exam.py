from data_cleaning import target_df
import pandas as pd

exam_names = target_df["regents_exam"].unique()

for exam in exam_names:
    df = target_df[target_df["regents_exam"] == exam]
    df["id"] = [n for n in range(df.shape[0])]
    filename = exam.lower().replace(" ", "_").replace("/", "_")
    df.to_csv(f"{filename}.csv", index = False)