import pandas as pd

all_df = pd.read_csv(r"overall_regents.csv")

# calculate the yearly average Mean Score for each exam
yearly_avg = all_df[["year", "regents_exam", "mean_score"]]
yearly_avg = yearly_avg.groupby(by=["year", "regents_exam"], as_index=False).mean()

# calculate the total number of test takers for each exam every year
yearly_test_takers = all_df[["year", "regents_exam", "total_tested"]]
yearly_test_takers = yearly_test_takers.groupby(by=["year", "regents_exam"], as_index=False).sum()

# perform an inner join to combine the average Mean Scores and number of test takers
yearly_df = yearly_avg.merge(right=yearly_test_takers, how="inner", on=["year", "regents_exam"])
yearly_df = yearly_df.sort_values(by=["year", "regents_exam"])
yearly_df["id"] = [i for i in range(yearly_df.shape[0])]

# calculate the average Mean Score for each exam in every borough
borough_avg = all_df[["borough", "regents_exam", "mean_score"]]
borough_avg = borough_avg.groupby(by=["borough", "regents_exam"], as_index=False).mean()

# calculate the number of test takers for each exam in every borough
borough_test_takers = all_df[["borough", "regents_exam", "total_tested"]]
borough_test_takers = borough_test_takers.groupby(by=["borough", "regents_exam"], as_index=False).sum()

# perform an inner join to combine the average Mean Scores and number of test takers in each borough
borough_df = borough_avg.merge(right=borough_test_takers, how="inner", on=["borough", "regents_exam"])
borough_df = borough_df.sort_values(by=["borough", "regents_exam"])
borough_df["id"] = [i for i in range(borough_df.shape[0])]

yearly_df.to_csv("yearly_avg.csv", index=False)
borough_df.to_csv("borough_avg.csv", index=False)