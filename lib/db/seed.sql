-- Seed data for Zyng lookup tables.
-- This file seeds the UNILORIN hierarchy from public/schools/unilorin.json exactly,
-- plus a few starter records for other schools from public/schools/index.json.

INSERT INTO schools (id, name, slug, is_active, logo_url)
VALUES
  (gen_random_uuid(), 'University of Ilorin', 'unilorin', true, '/schools/unilorin-logo.png'),
  (gen_random_uuid(), 'University of Lagos', 'unilag', false, '/schools/unilag-logo.png'),
  (gen_random_uuid(), 'University of Ibadan', 'ui', false, '/schools/ui-logo.png')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    is_active = EXCLUDED.is_active,
    logo_url = EXCLUDED.logo_url;

WITH school_target AS (
  SELECT id FROM schools WHERE slug = 'unilorin'
),
faculty_seed AS (
  SELECT *
  FROM (VALUES
    ('Agriculture', 'agriculture'),
    ('Arts', 'arts'),
    ('Basic Medical Sciences', 'basic-medical-sciences'),
    ('Clinical Sciences', 'clinical-sciences'),
    ('Communication & Information Sciences', 'cis'),
    ('Education', 'education'),
    ('Engineering & Technology', 'engineering'),
    ('Environmental Sciences', 'environmental-sciences'),
    ('Law', 'law'),
    ('Life Sciences', 'life-sciences'),
    ('Management Sciences', 'management-sciences'),
    ('Pharmaceutical Sciences', 'pharmacy'),
    ('Physical Sciences', 'physical-sciences'),
    ('Social Sciences', 'social-sciences'),
    ('Veterinary Medicine', 'veterinary-medicine')
  ) AS t(name, slug)
)
INSERT INTO faculties (school_id, name, slug)
SELECT st.id, fs.name, fs.slug
FROM school_target st
CROSS JOIN faculty_seed fs
ON CONFLICT (school_id, slug) DO UPDATE
SET name = EXCLUDED.name;

WITH school_target AS (
  SELECT id AS school_id FROM schools WHERE slug = 'unilorin'
),
faculty_target AS (
  SELECT f.id AS faculty_id, f.slug AS faculty_slug, f.school_id
  FROM faculties f
  JOIN school_target st ON st.school_id = f.school_id
),
department_seed AS (
  SELECT *
  FROM (VALUES
    ('agriculture', 'Agricultural Economics & Farm Management', 'agric-economics'),
    ('agriculture', 'Agricultural Extension & Rural Development', 'agric-extension'),
    ('agriculture', 'Agronomy', 'agronomy'),
    ('agriculture', 'Animal Production', 'animal-production'),
    ('agriculture', 'Crop Protection', 'crop-protection'),
    ('agriculture', 'Home Economics & Food Science', 'home-economics'),
    ('agriculture', 'Aquaculture & Fisheries', 'aquaculture'),
    ('agriculture', 'Forest Resources Management', 'forestry'),

    ('arts', 'Arabic', 'arabic'),
    ('arts', 'Christian Studies', 'christian-studies'),
    ('arts', 'Comparative Religious Studies', 'crs'),
    ('arts', 'English', 'english'),
    ('arts', 'French', 'french'),
    ('arts', 'History & International Studies', 'history'),
    ('arts', 'Islamic Studies', 'islamic-studies'),
    ('arts', 'Linguistics', 'linguistics'),
    ('arts', 'Performing Arts', 'performing-arts'),
    ('arts', 'Yoruba', 'yoruba'),

    ('basic-medical-sciences', 'Anatomy', 'anatomy'),
    ('basic-medical-sciences', 'Physiology', 'physiology'),
    ('basic-medical-sciences', 'Medical Biochemistry', 'medical-biochemistry'),

    ('clinical-sciences', 'Medicine & Surgery', 'medicine'),
    ('clinical-sciences', 'Radiography', 'radiography'),

    ('cis', 'Computer Science', 'computer-science'),
    ('cis', 'Information & Communication Science', 'ics'),
    ('cis', 'Library & Information Science', 'lis'),
    ('cis', 'Mass Communication', 'mass-communication'),
    ('cis', 'Telecommunication Science', 'telecom'),

    ('education', 'Adult & Primary Education', 'adult-education'),
    ('education', 'Arts Education', 'arts-education'),
    ('education', 'Counsellor Education', 'counsellor-education'),
    ('education', 'Educational Management', 'educational-management'),
    ('education', 'Educational Technology', 'educational-technology'),
    ('education', 'Health Promotion & Environmental Health Education', 'health-education'),
    ('education', 'Human Kinetics Education', 'human-kinetics'),
    ('education', 'Science Education', 'science-education'),
    ('education', 'Social Sciences Education', 'social-sciences-education'),
    ('education', 'Special Education', 'special-education'),

    ('engineering', 'Agricultural & Biosystems Engineering', 'agric-engineering'),
    ('engineering', 'Biomedical Engineering', 'biomedical-engineering'),
    ('engineering', 'Chemical Engineering', 'chemical-engineering'),
    ('engineering', 'Civil Engineering', 'civil-engineering'),
    ('engineering', 'Computer Engineering', 'computer-engineering'),
    ('engineering', 'Electrical & Electronics Engineering', 'electrical-engineering'),
    ('engineering', 'Food Engineering', 'food-engineering'),
    ('engineering', 'Materials & Metallurgical Engineering', 'materials-engineering'),
    ('engineering', 'Mechanical Engineering', 'mechanical-engineering'),
    ('engineering', 'Water Resources & Environmental Engineering', 'water-resources'),

    ('environmental-sciences', 'Architecture', 'architecture'),
    ('environmental-sciences', 'Estate Management', 'estate-management'),
    ('environmental-sciences', 'Quantity Surveying', 'quantity-surveying'),
    ('environmental-sciences', 'Surveying & Geoinformatics', 'surveying'),
    ('environmental-sciences', 'Urban & Regional Planning', 'urban-planning'),

    ('law', 'Common Law', 'common-law'),
    ('law', 'Islamic Law', 'islamic-law'),

    ('life-sciences', 'Biochemistry', 'biochemistry'),
    ('life-sciences', 'Microbiology', 'microbiology'),
    ('life-sciences', 'Plant Biology', 'plant-biology'),
    ('life-sciences', 'Zoology', 'zoology'),
    ('life-sciences', 'Optometry & Vision Science', 'optometry'),

    ('management-sciences', 'Accounting', 'accounting'),
    ('management-sciences', 'Finance', 'finance'),
    ('management-sciences', 'Industrial Relations & Personnel Management', 'irpm'),
    ('management-sciences', 'Business Administration', 'business-admin'),
    ('management-sciences', 'Marketing', 'marketing'),
    ('management-sciences', 'Public Administration', 'public-admin'),

    ('pharmacy', 'Clinical Pharmacy & Pharmacy Practice', 'clinical-pharmacy'),
    ('pharmacy', 'Pharmaceutical & Medicinal Chemistry', 'pharm-chemistry'),
    ('pharmacy', 'Pharmaceutics & Industrial Pharmacy', 'pharmaceutics'),
    ('pharmacy', 'Pharmacognosy & Drug Development', 'pharmacognosy'),
    ('pharmacy', 'Pharmacology & Toxicology', 'pharmacology'),

    ('physical-sciences', 'Chemistry', 'chemistry'),
    ('physical-sciences', 'Geology & Mineral Science', 'geology'),
    ('physical-sciences', 'Geophysics', 'geophysics'),
    ('physical-sciences', 'Industrial Chemistry', 'industrial-chemistry'),
    ('physical-sciences', 'Mathematics', 'mathematics'),
    ('physical-sciences', 'Physics', 'physics'),
    ('physical-sciences', 'Statistics', 'statistics'),

    ('social-sciences', 'Economics', 'economics'),
    ('social-sciences', 'Geography & Environmental Management', 'geography'),
    ('social-sciences', 'Political Science', 'political-science'),
    ('social-sciences', 'Psychology', 'psychology'),
    ('social-sciences', 'Sociology', 'sociology'),

    ('veterinary-medicine', 'Veterinary Anatomy', 'vet-anatomy'),
    ('veterinary-medicine', 'Veterinary Medicine', 'vet-medicine'),
    ('veterinary-medicine', 'Veterinary Microbiology', 'vet-microbiology'),
    ('veterinary-medicine', 'Veterinary Parasitology & Entomology', 'vet-parasitology'),
    ('veterinary-medicine', 'Veterinary Pathology', 'vet-pathology'),
    ('veterinary-medicine', 'Veterinary Physiology & Biochemistry', 'vet-physiology'),
    ('veterinary-medicine', 'Veterinary Public Health & Preventive Medicine', 'vet-public-health'),
    ('veterinary-medicine', 'Veterinary Surgery & Radiology', 'vet-surgery'),
    ('veterinary-medicine', 'Veterinary Theriogenology & Production', 'vet-theriogenology')
  ) AS d(faculty_slug, name, slug)
)
INSERT INTO departments (school_id, faculty_id, name, slug)
SELECT ft.school_id, ft.faculty_id, ds.name, ds.slug
FROM faculty_target ft
JOIN department_seed ds ON ds.faculty_slug = ft.faculty_slug
ON CONFLICT (faculty_id, slug) DO UPDATE
SET name = EXCLUDED.name,
    school_id = EXCLUDED.school_id;
