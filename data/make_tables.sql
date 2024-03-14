CREATE TABLE regents (
	id SERIAL PRIMARY KEY,
	borough VARCHAR(15),
	school_dbn VARCHAR(10),
	school_name VARCHAR(100),
	year SMALLINT,
	regents_exam VARCHAR(50),
	total_tested SMALLINT,
	mean_score DECIMAL,
	percent_65_or_above DECIMAL
);