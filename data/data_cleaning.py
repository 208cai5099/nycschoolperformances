import pandas as pd

## get the overall data without any aggregations
whole_df = pd.read_excel(r"C:\Users\zoo-b\Documents\NYCSchoolPerformances\data\regents_data.xlsx", sheet_name="All Students")

# print(df.dtypes)

# keep only school dbn, school name, year, exam, mean score, percent of 65% or above, and number of test takers
target_df = whole_df[["School DBN", "School Name", "Regents Exam", "Year", "Mean Score", "Total Tested", "Percent Scoring 65 or Above"]]

# replace 's' with NaN
target_df = target_df.where(target_df != 's')

# drop all rows with NaN
target_df = target_df.dropna()
# print(target_df.shape)

# check for any more 's'
if 's' in target_df["Mean Score"].unique():
    print("There are still more 's'")

target_df = target_df.rename(columns = {"School DBN" : "school_dbn", 
                                        "School Name" : "school_name",
                                        "Regents Exam" : "regents_exam",
                                        "Year" : "year", 
                                        "Mean Score" : "mean_score",
                                        "Total Tested" : "total_tested",
                                        "Percent Scoring 65 or Above" : "percent_65_or_above"})

target_df = target_df.astype({"school_dbn" : "str",
                              "school_name" : "str",
                              "regents_exam" : "str",
                              "year" : "int32",
                              "mean_score" : "float32",
                              "total_tested" : "int32",
                              "percent_65_or_above" : "float32"})

## add a column of ID numbers for each record
target_df["id"] = [n for n in range(target_df.shape[0])]

## reorder the columns
target_df = target_df.loc[:, ["id", "school_dbn", "school_name", "year", "regents_exam", "total_tested", "mean_score", "percent_65_or_above"]]

# print(target_df.dtypes)
# print(target_df.head())


## get all school names
with open("school_names.txt", "w") as file:
    for name in target_df["school_name"].unique():

        ## get the school's DBN
        dbn = target_df[target_df["school_name"] == name]["school_dbn"].unique()

        file.write(f"{dbn}: {name}\n")
    
    file.close()

## reformat some school names that are misspelled or truncated
## map original name to its reformatted name
original_names = []
with open("data\original_names.txt", "r") as file:
    original_names.extend(file.readlines())

corrected_names = []
with open("data\new_names.txt", "r") as file:
    corrected_names.extend(file.readlines())

name_corrections_dict = {}

if len(original_names) != len(corrected_names):
    print("The number of corrections does not match number of incorrect names.")
else:
    # print(f"There are a total of {len(corrected_names)} corrections.")
    for i in range(len(corrected_names)):
        original_name = original_names[i][12:].strip().strip("\n")
        corrected_name = corrected_names[i][12:].strip().strip("\n")
        name_corrections_dict[original_name] = corrected_name

def updateValue(x, correction_dictionary):

    if correction_dictionary.get(x) is None:
        return x
    else:
        return correction_dictionary.get(x)

name_col = target_df["school_name"].apply(lambda x : updateValue(x, name_corrections_dict))

target_df["school_name"] = name_col

## fix the formatting for specific Regents exam names to get rid of backslash
reformatted_exam_names = {"Common Core Algebra2" : "Common Core Algebra 2", 
                          "Algebra2/Trigonometry" : "Algebra 2 (Trigonometry)",
                          "Physical Settings/Chemistry": "Chemistry",
                          "Physical Settings/Physics" : "Physics",
                          "Physical Settings/Earth Science": "Earth Science"
                          }

exam_col = target_df["regents_exam"].apply(lambda x : updateValue(x, reformatted_exam_names))
target_df["regents_exam"] = exam_col

## export the cleaned dataset
target_df.to_csv("data_by_school.csv", index = False)