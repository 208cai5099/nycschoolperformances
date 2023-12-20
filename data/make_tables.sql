CREATE TABLE schools (
	id SERIAL PRIMARY KEY,
	school_dbn VARCHAR(10),
	school_name VARCHAR(100),
	year SMALLINT,
	regents_exam VARCHAR(50),
	total_tested SMALLINT,
	mean_score DECIMAL,
	percent_65_or_above DECIMAL
);