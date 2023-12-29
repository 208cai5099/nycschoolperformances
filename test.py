import pandas as pd

df = pd.read_csv("data_by_school.csv")

for i in df["school_name"].unique():
    print(i)