import pandas as pd
import numpy as np

'''
Filters for rows that have numeric data
'''
def remove_redacted_rows(df):
  return df[df["Mean Score"] != "s"]

'''
Loads in the requested sheet
'''
def load_sheet(filename, sheet):
  return pd.read_excel(filename, sheet_name=sheet)

'''
Corrects the typos in the column names
'''
def correct_col_spelling(df):
  return df.rename(columns={
      "Number meeting CUNY proficiency requirmenets" : "Number meeting CUNY proficiency requirements",
      "Percent meeting CUNY proficiency requirmenets" : "Percent meeting CUNY proficiency requirements"
  })

'''
Changes the data types of specific columns
Total Tested, Number Scoring x, Number meeting: int32
Mean Score, Percent Scoring x, Percent meeting: float32
Year: np.datetime
'''
def change_dtypes(df):

  # turn the na values into numpy nan values
  for col in ["Percent meeting CUNY proficiency requirements", "Number meeting CUNY proficiency requirements"]:
      df.loc[:, col] = df[col].apply(lambda value : np.nan if value == "na" else float(value))

  df = df.astype({
      'School DBN' : str,
      'School Name' : str,
      'Total Tested' : np.int32,
      'Mean Score' : np.float32,
      'Number Scoring Below 65' : np.int32,
      'Percent Scoring Below 65' : np.float32,
      'Number Scoring 65 or Above' : np.int32,
      'Percent Scoring 65 or Above' : np.float32,
      'Number Scoring 80 or Above' : np.int32,
      'Percent Scoring 80 or Above' : np.float32,
      'Number meeting CUNY proficiency requirements' : np.float32,
      'Percent meeting CUNY proficiency requirements' : np.float32,
  })

  return df

'''
Correct the names of the schools due to typos or truncation
New Visions high schools have multiple locations (need to append a number to each one)
New Visions actually changed its name recently but stick to old names for now
Three schools have two DBNs each: Aspirations Diploma Plus High School, Crotona Academy High School, Gotham Professional Arts Academy
These schools probably moved
'''
def correct_school_names(df):

  ## map a pair of DBN and original name to corrected name
  original_names = []
  with open(r"data\original_names.txt", "r") as original:
      original_names.extend(original.readlines())

  corrected_names = []
  with open(r"data\new_names.txt", "r") as new:
      corrected_names.extend(new.readlines())

  corrections_dict = {}

  if len(original_names) != len(corrected_names):
      print("The number of corrections does not match number of incorrect names.")

  else:
      for i in range(len(corrected_names)):
          original_dbn = original_names[i].split("']: ")[0].strip().strip("\n")[2:]
          original_name = original_names[i].split("']: ")[1].strip().strip("\n")

          corrected_name = corrected_names[i].split("']: ")[1].strip().strip("\n")

          corrections_dict[(original_dbn, original_name)] = corrected_name.strip('"')

  # concatenate the DBN and name columns
  placeholder = df["School DBN"] + " +++ " + df["School Name"]
  placeholder = placeholder.apply(lambda value : (value.split(" +++ ")[0], value.split(" +++ ")[1]))

  new_name = placeholder.apply(lambda value : value[1] if corrections_dict.get(value) is None
                               else corrections_dict[value])

  df.loc[:, "School Name"] = new_name

  return df

'''
Renames the exam names to remove any backslashes
'''
def rename_exams(df):
  reformatted_exam_names = {"Common Core Algebra2" : "Common Core Algebra 2",
                            "Algebra2/Trigonometry" : "Algebra 2 (Trigonometry)",
                            "Physical Settings/Chemistry": "Chemistry",
                            "Physical Settings/Physics" : "Physics",
                            "Physical Settings/Earth Science": "Earth Science"
                            }

  df.loc[:, "Regents Exam"] = df["Regents Exam"].apply(lambda value : value if reformatted_exam_names.get(value) is None
                                                       else reformatted_exam_names[value])

  return df

'''
Remove the old English and math exams before Common Core
'''
def filter_exams(df):
  return df[df["Regents Exam"].isin(['Living Environment', 'Common Core Algebra', 'Common Core English',
                                    'US History and Government', 'Common Core Geometry', 'Global History and Geography',
                                    'Earth Science', 'Spanish', 'Common Core Algebra 2', 'Chemistry', 'Chinese',
                                    'Physics', 'French', 'Italian'])]

'''
Filter for data in the years 2017, 2018, 2019, 2022, 2023
Common Core was still rolling out in 2015 and 2016 for the most part
COVID affected 2020 and 2021 exams
'''
def filter_years(df):
  return df[df["Year"].isin([2017, 2018, 2019, 2022, 2023])]

'''
Adds a column of borough names for the rows
'''
def add_borough_col(df):

  borough_list = []
  for dbn in df["School DBN"]:

      if "X" in dbn:
          borough_list.append("Bronx")

      elif "K" in dbn:
          borough_list.append("Brooklyn")

      elif "R" in dbn:
          borough_list.append("Staten Island")

      elif "Q" in dbn:
          borough_list.append("Queens")

      elif "M" in dbn:
          borough_list.append("Manhattan")

  df["Borough"] = borough_list

  return df

'''
Rename every column so that every letter is lowercase 
and each word is separated by an underscore
'''
def format_col(df):
    new_columns = {}
    
    for col in df.columns:
       new_columns[col] = "_".join([term.lower() for term in col.split(" ")])
    
    return df.rename(columns=new_columns)

'''
Select only the specified list of columns or a specific column
'''
def select_columns(df, columns):
   
   if type(columns) == str:
      return df[[columns]]
   
   else:
      return df[columns]

'''
Adds a column of row numbers
'''
def add_row_numbers(df):
   
   df["id"] = [i for i in range(df.shape[0])]

   return df

'''
Sort the df by specific column(s)
'''
def sort_df(df, columns):
   return df.sort_values(by=columns)

'''
Call on previous helper functions to load, clean, and process a sheet of data
'''
def load_and_process_sheet(filename, sheet):
  df = load_sheet(filename, sheet)
  df = correct_col_spelling(df)
  df = remove_redacted_rows(df)
  df = change_dtypes(df)
  df = rename_exams(df)
  df = add_borough_col(df)
  df = correct_school_names(df)
  df = filter_years(df)
  df = filter_exams(df)
  df = format_col(df)
  return df

# extract the general performance data from the All Students sheet
filename = r"data\2015_to_2023_regents_data.xlsx"
all_df = load_and_process_sheet(filename, "All Students")
all_df = select_columns(all_df, ["borough", "school_dbn", "school_name", "year", "regents_exam", "total_tested", "mean_score", "percent_scoring_65_or_above"])
all_df = all_df.rename(columns={"percent_scoring_65_or_above" : "percent_65_or_above"})
all_df = sort_df(all_df, ["borough", "school_dbn", "school_name", "year", "regents_exam"])
all_df = add_row_numbers(all_df)
all_df.to_csv("overall_regents.csv", index=False)

# extract the data from the By ELL Status sheet
ell_df = load_and_process_sheet(filename, "By ELL Status")
ell_df = select_columns(ell_df, ["borough", "school_dbn", "school_name", "year", "category", "regents_exam", "total_tested", "mean_score", "percent_scoring_65_or_above"])

# extract the data from the By SWD Status sheet
swd_df = load_and_process_sheet(filename, "By SWD Status")
swd_df = select_columns(swd_df, ["borough", "school_dbn", "school_name", "year", "category", "regents_exam", "total_tested", "mean_score", "percent_scoring_65_or_above"])

# calculate median mean score and passing rate of every exam by borough
all_median_by_borough_df = all_df[["borough", "year", "regents_exam", "mean_score", "percent_65_or_above"]].groupby(by=["borough", "year", "regents_exam"], as_index=False).median()
all_median_by_borough_df = all_median_by_borough_df.rename(columns={"borough" : "category", "mean_score" : "median_mean_score", "percent_65_or_above" : "median_percent_65_or_above"})
all_median_by_borough_df = sort_df(all_median_by_borough_df, ["year", "category", "regents_exam"])
all_median_by_borough_df = add_row_numbers(all_median_by_borough_df)
all_median_by_borough_df.to_csv("regents_median_by_borough.csv", index=False)

# calculate median mean score and passing rate of every exam by ELL status
ell_median_df = ell_df[["year", "category", "regents_exam", "mean_score", "percent_scoring_65_or_above"]].groupby(by=["year", "category", "regents_exam"], as_index=False).median()
ell_median_df = ell_median_df.rename(columns={"mean_score" : "median_mean_score", "percent_scoring_65_or_above" : "median_percent_65_or_above"})
ell_median_df = sort_df(ell_median_df, ["year", "category", "regents_exam"])
ell_median_df = add_row_numbers(ell_median_df)
ell_median_df.to_csv("regents_median_by_ell.csv", index=False)

# calculate median mean score and passing rate of every exam by SWD status
swd_median_df = swd_df[["year", "category", "regents_exam", "mean_score", "percent_scoring_65_or_above"]].groupby(by=["year", "category", "regents_exam"], as_index=False).median()
swd_median_df = swd_median_df.rename(columns={"mean_score" : "median_mean_score", "percent_scoring_65_or_above" : "median_percent_65_or_above"})
swd_median_df = sort_df(swd_median_df, ["year", "category", "regents_exam"])
swd_median_df = add_row_numbers(swd_median_df)
swd_median_df.to_csv("regents_median_by_swd.csv", index=False)

# extract a csv file of every school's DBN and their name concatenated together
subset = all_df[["school_dbn", "school_name"]]
subset = subset.drop_duplicates()
subset.loc[:, "schools"] = subset.loc[:, "school_dbn"].str.cat(others=subset.loc[:, "school_name"], sep=": ")
subset = subset.drop(columns=["school_dbn", "school_name"])
subset = add_row_numbers(subset)
#subset.to_csv("schools.csv", index=False)