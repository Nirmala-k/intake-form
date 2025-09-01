import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: "interchange.proxy.rlwy.net",
  user: "root",
  password: "GjCcvrpAqtnTWLUDbxUvdWGaSgxdzCvu",
  database: "railway",
  port: 14051
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
});

/**
 * Update schema to add all fields from Patient type
 */
const updateSchema = () => {
  // const alterTableSQL = `
  //   ALTER TABLE patient_records 
  //   ADD COLUMN date_of_sample_collection DATE,
  //   ADD COLUMN referral_doctor VARCHAR(255),
  //   ADD COLUMN pre_counselor VARCHAR(255),
  //   ADD COLUMN address TEXT,

  //   ADD COLUMN test_names JSON,
  //   ADD COLUMN other_test TEXT,
  //   ADD COLUMN indications_for_testing TEXT,
  //   ADD COLUMN specific_genes TEXT,
  //   ADD COLUMN sample_types JSON,
  //   ADD COLUMN other_sample TEXT,

  //   ADD COLUMN complaints JSON,
  //   ADD COLUMN genetic_testing_reasons JSON,

  //   ADD COLUMN past_medical_history JSON,
  //   ADD COLUMN past_surgical_history JSON,

  //   ADD COLUMN family_history JSON,
  //   ADD COLUMN consanguineous_marriage BOOLEAN DEFAULT FALSE,

  //   ADD COLUMN mental_health_history JSON,
  //   ADD COLUMN menstrual_cycles TEXT,
  //   ADD COLUMN infertility_history TEXT,
  //   ADD COLUMN erectile_dysfunction TEXT,

  //   ADD COLUMN medicines JSON,
  //   ADD COLUMN review_of_systems JSON,
  //   ADD COLUMN expandedSystems JSON,
  //   ADD COLUMN alcohol TEXT,
  //   ADD COLUMN smoking TEXT,
  //   ADD COLUMN wake_up_time TEXT,
  //   ADD COLUMN bed_time TEXT,
  //   ADD COLUMN workout TEXT,
  //   ADD COLUMN workout_frequency TEXT,
  //   ADD COLUMN active_sport_young TEXT,
  //   ADD COLUMN sleep TEXT,
  //   ADD COLUMN preferred_workout TEXT,
  //   ADD COLUMN meals_per_day TEXT,
  //   ADD COLUMN processed_foods TEXT,
  //   ADD COLUMN outside_food TEXT,
  //   ADD COLUMN carbonated_drinks TEXT,
  //   ADD COLUMN cuisine_preference JSON,
  //   ADD COLUMN other_cuisine_preference TEXT,

  //   ADD COLUMN blood_pressure VARCHAR(50),
  //   ADD COLUMN pulse_rate VARCHAR(50),
  //   ADD COLUMN height VARCHAR(50),
  //   ADD COLUMN weight VARCHAR(50),
  //   ADD COLUMN BMI VARCHAR(50),

  //   ADD COLUMN mandatory_tests JSON,
  //   ADD COLUMN dosha_v JSON,
  //   ADD COLUMN dosha_p JSON,
  //   ADD COLUMN dosha_k JSON
  // `;

  // db.query(alterTableSQL, (err) => {
  //   if (err) {
  //     console.log('⚠️ Schema update failed (old MySQL may not support):', err.message);
  //   } else {
  //     console.log('✅ Table schema updated successfully');
  //   }
  // });
};
// updateSchema();

/**
 * Fetch all patients
 */
app.get('/api/patients', (req, res) => {
  db.query('SELECT * FROM patient_records', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = results[0];
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    }
  );
});

/**
 * Insert new patient
 */
app.post('/api/patients', (req, res) => {
  const data = req.body;

  const sql = `
    INSERT INTO patient_records (
      full_name, age, gender, phone_number, email, date_of_sample_collection,
      referral_doctor, pre_counselor, address,
      test_names, other_test, indications_for_testing, specific_genes,
      sample_types, other_sample,
      complaints, genetic_testing_reasons,
      past_medical_history, past_surgical_history,
      family_history, consanguineous_marriage,
      mental_health_history, menstrual_cycles, infertility_history, erectile_dysfunction,
      medicines, review_of_systems, expandedSystems,
      alcohol, smoking, wake_up_time, bed_time, workout, workout_frequency, active_sport_young,
      sleep, preferred_workout, meals_per_day, processed_foods, outside_food, carbonated_drinks,
      cuisine_preference, other_cuisine_preference,
      blood_pressure, pulse_rate, height, weight, BMI,
      mandatory_tests, dosha_v, dosha_p, dosha_k
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(sql, [
    data.full_name, data.age, data.gender, data.phone_number, data.email, data.date_of_sample_collection,
    data.referral_doctor, data.pre_counselor, data.address,
    JSON.stringify(data.test_names), data.other_test, data.indications_for_testing, data.specific_genes,
    JSON.stringify(data.sample_types), data.other_sample,
    JSON.stringify(data.complaints), JSON.stringify(data.genetic_testing_reasons),
    JSON.stringify(data.past_medical_history), JSON.stringify(data.past_surgical_history),
    JSON.stringify(data.family_history), data.consanguineous_marriage,
    JSON.stringify(data.mental_health_history), data.menstrual_cycles, data.infertility_history, data.erectile_dysfunction,
    JSON.stringify(data.medicines), JSON.stringify(data.review_of_systems), JSON.stringify(data.expandedSystems),
    data.alcohol, data.smoking, data.wake_up_time, data.bed_time, data.workout, data.workout_frequency, data.active_sport_young,
    data.sleep, data.preferred_workout, data.meals_per_day, data.processed_foods, data.outside_food, data.carbonated_drinks,
    JSON.stringify(data.cuisine_preference), data.other_cuisine_preference,
    data.blood_pressure, data.pulse_rate, data.height, data.weight, data.BMI,
    JSON.stringify(data.mandatory_tests), JSON.stringify(data.dosha_v), JSON.stringify(data.dosha_p), JSON.stringify(data.dosha_k)
  ], (err, result) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: '✅ Patient added successfully', id: result.insertId });
  });
});

/**
 * Fetch single patient by id
 */
app.get('/api/patients/:id', (req, res) => {
  const patientId = req.params.id;

  db.query('SELECT * FROM patient_records WHERE id = ?', [patientId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const patient = results[0];

    // Parse JSON fields back into arrays/objects
    const jsonFields = [
      'test_names','sample_types','complaints','genetic_testing_reasons',
      'past_medical_history','past_surgical_history','family_history',
      'mental_health_history','medicines','review_of_systems','expandedSystems',
      'cuisine_preference','mandatory_tests','dosha_v','dosha_p','dosha_k'
    ];

    jsonFields.forEach(f => {
      if (patient[f]) {
        try { patient[f] = JSON.parse(patient[f]); }
        catch { patient[f] = []; }
      }
    });

    res.json(patient);
  });
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
