import pandas as pd

cleaned_df = pd.read_csv(r"C:\Users\zoo-b\Documents\nycschoolperformances\data\data_by_school.csv")

## get unique boroughs
boroughs = cleaned_df["borough"].unique()

## calculate average score on each test ini each year
yearly_avg = {"year" : [], "regents_exam" : [], "total_tested" : [], "mean_score": [], "percent_65_or_above" : []}

for year in sorted(cleaned_df["year"].unique()):

    for exam in sorted(cleaned_df["regents_exam"].unique()):

        target_subset = cleaned_df[cleaned_df["year"] == year]
        target_subset = target_subset[target_subset["regents_exam"] == exam]

        yearly_avg["year"].append(year)
        yearly_avg["regents_exam"].append(exam)

        yearly_avg["total_tested"].append(target_subset["total_tested"].sum())
        yearly_avg["mean_score"].append(target_subset["mean_score"].mean())
        yearly_avg["percent_65_or_above"].append(target_subset["percent_65_or_above"].mean())

yearly_avg_df = pd.DataFrame(yearly_avg)
yearly_avg_df = yearly_avg_df.dropna()

## calculate average score on each test across all the years
borough_avg = {"borough" : [], "regents_exam" : [], "total_tested" : [], "mean_score": [], "percent_65_or_above" : []}

for boro in boroughs:

    boro_subset = cleaned_df[cleaned_df["borough"] == boro]

    boro_subset = boro_subset[["regents_exam", "total_tested", "mean_score", "percent_65_or_above"]]

    for exam in sorted(boro_subset["regents_exam"].unique()):

        target_subset = boro_subset[boro_subset["regents_exam"] == exam]

        borough_avg["borough"].append(boro)
        borough_avg["regents_exam"].append(exam)

        borough_avg["total_tested"].append(target_subset["total_tested"].sum())
        borough_avg["mean_score"].append(target_subset["mean_score"].mean())
        borough_avg["percent_65_or_above"].append(target_subset["percent_65_or_above"].mean())

borough_avg_df = pd.DataFrame(borough_avg)
borough_avg_df = borough_avg_df.dropna()

## save results as csv files
yearly_avg_df.to_csv("yearly_avg.csv", index=False)
borough_avg_df.to_csv("borough_avg.csv", index=False)
