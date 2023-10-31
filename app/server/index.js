const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connection = require("./db");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const uuid = require('uuid');
const officegen = require('officegen');
const romanize = require('romanize');
const PDFDocument = require('pdfkit');
const fs = require('fs');




const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser("mySecretKey"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

// Check if the TUPCID already exists in the database for both students and faculty
const checkTUPCIDExists = async (TUPCID, table) => {
  try {
    const query = `SELECT TUPCID FROM ${table} WHERE TUPCID = ?`;
    const [rows] = await connection.query(query, [TUPCID]);
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
};

const checkingClass = async (class_code, class_name, subject_name) => {
  try {
    const query =
      "SELECT COUNT(*) as count FROM class_table where class_code = ? or subject_name = ? or class_name = ?";
    const [all] = await connection.query(query, [
      class_code,
      subject_name,
      class_name,
    ]);
    const count = all[0].count
    return count;
  } catch (error) {
    throw error;
  }
};

//check login

// Helper function to check login credentials for both students and faculty
const checkLogin = async (table, TUPCID, PASSWORD, accountType) => {
  try {
    const query = `SELECT * FROM ${table}_accounts WHERE TUPCID = ?`;
    const [rows] = await connection.query(query, [TUPCID]);

    if (rows.length === 0) {
      return { accountType: null };
    }

    const user = rows[0];
    const isPasswordMatch = await bcryptjs.compare(PASSWORD, user.PASSWORD);

    if (isPasswordMatch) {
      return { accountType };
    } else {
      return { accountType: null };
    }
  } catch (error) {
    throw error;
  }
};

// FOR STUDENT REGISTRATION
app.post("/studreg", (req, res) => {
  const {
    TUPCID,
    SURNAME,
    FIRSTNAME,
    MIDDLENAME,
    GSFEACC,
    COURSE,
    SECTION,
    YEAR,
    STATUS,
    PASSWORD,
  } = req.body;

  // Check if the TUPCID already exists in the student_accounts table
  checkTUPCIDExists(TUPCID, "student_accounts")
    .then((exists) => {
      if (exists) {
        return res
          .status(409)
          .send({
            message: "TUPCID already exists. Student registration failed.",
          });
      }

      // TUPCID does not exist, proceed with student registration
      if (STATUS === "REGULAR" || STATUS === "IRREGULAR") {
        // Hash the password before storing it in the database
        bcryptjs.hash(PASSWORD, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send({ message: "Server error" });
          }

          const query = `INSERT INTO student_accounts (TUPCID, SURNAME, FIRSTNAME, MIDDLENAME, GSFEACC, COURSE,SECTION , YEAR, STATUS, PASSWORD) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          connection.query(
            query,
            [
              TUPCID,
              SURNAME,
              FIRSTNAME,
              MIDDLENAME,
              GSFEACC,
              COURSE,
              SECTION,
              YEAR,
              STATUS,
              hashedPassword,
            ],
            (err, result) => {
              if (err) {
                console.error("Error executing the INSERT query:", err);
                return res.status(500).send({ message: "Database error" });
              }else{
              console.log("yes");
              return res
                .status(200)
                .send({ message: "Student registered successfully" });
              }
            }
          );
        });
      } else {
        return res.status(400).send({ message: "Invalid STATUS value" });
      }
    })
    .catch((err) => {
      console.error("Error checking TUPCID in the database:", err);
      return res.status(500).send({ message: "Database error" });
    });
});

// FOR PROFESSOR REGISTRATION
app.post("/facultyreg", (req, res) => {
  const {
    TUPCID,
    SURNAME,
    FIRSTNAME,
    MIDDLENAME,
    GSFEACC,
    SUBJECTDEPT,
    PASSWORD,
  } = req.body;

  // Check if the TUPCID already exists in the faculty_accounts table
  checkTUPCIDExists(TUPCID, "faculty_accounts")
    .then((exists) => {
      if (exists) {
        return res
          .status(409)
          .send({
            message: "TUPCID already exists. Faculty registration failed.",
          });
      }

      // TUPCID does not exist, proceed with faculty registration
      bcryptjs.hash(PASSWORD, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).send({ message: "Server error" });
        }

        const query = `INSERT INTO faculty_accounts (TUPCID, SURNAME, FIRSTNAME, MIDDLENAME, GSFEACC, SUBJECTDEPT, PASSWORD) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(
          query,
          [
            TUPCID,
            SURNAME,
            FIRSTNAME,
            MIDDLENAME,
            GSFEACC,
            SUBJECTDEPT,
            hashedPassword,
          ],
          (err, result) => {
            if (err) {
              console.error("Error executing the INSERT query:", err);
              return res.status(500).send({ message: "Database error" });
            }
            return res
              .status(200)
              .send({ message: "Faculty registered successfully" });
          }
        );
      });
    })
    .catch((err) => {
      console.error("Error checking TUPCID in the database:", err);
      return res.status(500).send({ message: "Database error" });
    });
});

// DELETE STUDENT DATA
app.delete("/students/:TUPCID", (req, res) => {
  const { TUPCID } = req.params;
  const query = "DELETE FROM student_accounts WHERE TUPCID = ?";
  connection.query(query, [TUPCID], (err, result) => {
    if (err) {
      console.error("Error deleting student data:", err);
      return res.status(500).send({ message: "Database error" });
    } else if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Student not found" });
    }
    return res.status(200).send({ message: "Student deleted successfully" });
  });
});

// DELETE FACULTY DATA
app.delete("/faculty/:TUPCID", (req, res) => {
  const { TUPCID } = req.params;
  const query = "DELETE FROM faculty_accounts WHERE TUPCID = ?";
  connection.query(query, [TUPCID], (err, result) => {
    if (err) {
      console.error("Error deleting faculty data:", err);
      return res.status(500).send({ message: "Database error" });
    } else if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Faculty not found" });
    }
    return res.status(200).send({ message: "Faculty deleted successfully" });
  });
});

// DELETE ADMIN ACCOUNT
app.delete("/admin/:TUPCID", (req, res) => {
  const TUPCID = req.params.TUPCID;
  const query = "DELETE FROM admin_accounts WHERE TUPCID = ?";
  connection.query(query, [TUPCID], (err, result) => {
    if (err) {
      console.error("Error deleting admin data:", err);
      return res.status(500).send({ message: "Database error" });
    } else if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Admin not found" });
    }
    return res.status(200).send({ message: "Admin deleted successfully" });
  });
});

// GET STUDENT DATA
app.get("/students", (req, res) => {
  const query =
    "SELECT TUPCID, SURNAME, FIRSTNAME, GSFEACC, COURSE, YEAR, STATUS, PASSWORD FROM student_accounts";
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching student data:", err);
      return res.status(500).send({ message: "Database error" });
    }
    return res.status(200).send(result);
  });
});

// GET FACULTY DATA
app.get("/faculty", (req, res) => {
  const query =
    "SELECT TUPCID, SURNAME, FIRSTNAME, MIDDLENAME, GSFEACC, SUBJECTDEPT, PASSWORD FROM faculty_accounts";
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching faculty data:", err);
      return res.status(500).send({ message: "Database error" });
    }
    return res.status(200).send(result);
  });
});

// GET ADMIN ACCOUNTS
app.get("/admin", (req, res) => {
  const query = "SELECT TUPCID, ADMINNAME, EMAIL, PASSWORD FROM admin_accounts";
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching admin accounts:", err);
      return res.status(500).send({ message: "Database error" });
    }
    return res.status(200).send(result);
  });
});

// UPDATE STUDENT DATA
app.put("/student/:TUPCID", (req, res) => {
  const TUPCID = req.params.TUPCID;
  const updatedData = req.body;

  // Check if the TUPCID exists in the student_accounts table
  checkTUPCIDExists(TUPCID, "student_accounts")
    .then((exists) => {
      if (!exists) {
        return res.status(404).send({ message: "Student not found" });
      }

      // Hash the password before updating (if provided)
      if (updatedData.PASSWORD) {
        bcryptjs.hash(updatedData.PASSWORD, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send({ message: "Server error" });
          }

          // Remove the password from updatedData since we don't want to update it separately
          const { PASSWORD, ...dataToUpdate } = updatedData;

          const fieldsToUpdate = Object.keys(dataToUpdate)
            .map((key) => `${key} = ?`)
            .join(", ");

          const query = `UPDATE student_accounts
                         SET ${fieldsToUpdate}, PASSWORD = ?
                         WHERE TUPCID = ?`;

          connection.query(
            query,
            [...Object.values(dataToUpdate), hashedPassword, TUPCID],
            (err, result) => {
              if (err) {
                console.error("Error updating student data:", err);
                return res.status(500).send({ message: "Database error" });
              }
              return res
                .status(200)
                .send({ message: "Student updated successfully" });
            }
          );
        });
      } else {
        // If the PASSWORD field is not being updated, send the data to the server without hashing
        const fieldsToUpdate = Object.keys(updatedData)
          .filter((key) => key !== "TUPCID") // Exclude TUPCID from the fields to update
          .map((key) => `${key} = ?`)
          .join(", ");

        const query = `UPDATE student_accounts
                       SET ${fieldsToUpdate}
                       WHERE TUPCID = ?`;

        connection.query(
          query,
          [
            ...Object.values(updatedData).filter(
              (val) => val !== updatedData.PASSWORD
            ),
            TUPCID,
          ],
          (err, result) => {
            if (err) {
              console.error("Error updating student data:", err);
              return res.status(500).send({ message: "Database error" });
            }
            return res
              .status(200)
              .send({ message: "Student updated successfully" });
          }
        );
      }
    })
    .catch((err) => {
      console.error("Error checking TUPCID in the database:", err);
      return res.status(500).send({ message: "Database error" });
    });
});

// UPDATE FACULTY DATA
app.put("/faculty/:TUPCID", (req, res) => {
  const TUPCID = req.params.TUPCID;
  const updatedData = req.body;

  // Check if the TUPCID exists in the faculty_accounts table
  checkTUPCIDExists(TUPCID, "faculty_accounts")
    .then((exists) => {
      if (!exists) {
        return res.status(404).send({ message: "Faculty not found" });
      }

      // Hash the password before updating (if provided)
      if (updatedData.PASSWORD) {
        bcryptjs.hash(updatedData.PASSWORD, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send({ message: "Server error" });
          }

          // Remove the password from updatedData since we don't want to update it separately
          const { PASSWORD, ...dataToUpdate } = updatedData;

          const fieldsToUpdate = Object.keys(dataToUpdate)
            .map((key) => `${key} = ?`)
            .join(", ");

          const query = `UPDATE faculty_accounts
                         SET ${fieldsToUpdate}, PASSWORD = ?
                         WHERE TUPCID = ?`;

          connection.query(
            query,
            [...Object.values(dataToUpdate), hashedPassword, TUPCID],
            (err, result) => {
              if (err) {
                console.error("Error updating faculty data:", err);
                return res.status(500).send({ message: "Database error" });
              }
              return res
                .status(200)
                .send({ message: "Faculty updated successfully" });
            }
          );
        });
      } else {
        // If the PASSWORD field is not being updated, send the data to the server without hashing
        const fieldsToUpdate = Object.keys(updatedData)
          .filter((key) => key !== "TUPCID") // Exclude TUPCID from the fields to update
          .map((key) => `${key} = ?`)
          .join(", ");

        const query = `UPDATE faculty_accounts
                       SET ${fieldsToUpdate}
                       WHERE TUPCID = ?`;

        connection.query(
          query,
          [
            ...Object.values(updatedData).filter(
              (val) => val !== updatedData.PASSWORD
            ),
            TUPCID,
          ],
          (err, result) => {
            if (err) {
              console.error("Error updating faculty data:", err);
              return res.status(500).send({ message: "Database error" });
            }
            return res
              .status(200)
              .send({ message: "Faculty updated successfully" });
          }
        );
      }
    })
    .catch((err) => {
      console.error("Error checking TUPCID in the database:", err);
      return res.status(500).send({ message: "Database error" });
    });
});

// UPDATE ADMIN DATA
app.put("/admin/:TUPCID", (req, res) => {
  const TUPCID = req.params.TUPCID;
  const updatedData = req.body;

  // Check if the TUPCID exists in the admin_accounts table
  checkTUPCIDExists(TUPCID, "admin_accounts")
    .then((exists) => {
      if (!exists) {
        return res.status(404).send({ message: "Faculty not found" });
      }

      // Hash the password before updating (if provided)
      if (updatedData.PASSWORD) {
        bcryptjs.hash(updatedData.PASSWORD, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send({ message: "Server error" });
          }

          // Remove the password from updatedData since we don't want to update it separately
          const { PASSWORD, ...dataToUpdate } = updatedData;

          const fieldsToUpdate = Object.keys(dataToUpdate)
            .map((key) => `${key} = ?`)
            .join(", ");

          const query = `UPDATE admin_accounts
                         SET ${fieldsToUpdate}, PASSWORD = ?
                         WHERE TUPCID = ?`;

          connection.query(
            query,
            [...Object.values(dataToUpdate), hashedPassword, TUPCID],
            (err, result) => {
              if (err) {
                console.error("Error updating admin data:", err);
                return res.status(500).send({ message: "Database error" });
              }
              return res
                .status(200)
                .send({ message: "admin updated successfully" });
            }
          );
        });
      } else {
        // If the PASSWORD field is not being updated, send the data to the server without hashing
        const fieldsToUpdate = Object.keys(updatedData)
          .filter((key) => key !== "TUPCID") // Exclude TUPCID from the fields to update
          .map((key) => `${key} = ?`)
          .join(", ");

        const query = `UPDATE admin_accounts
                       SET ${fieldsToUpdate}
                       WHERE TUPCID = ?`;

        connection.query(
          query,
          [
            ...Object.values(updatedData).filter(
              (val) => val !== updatedData.PASSWORD
            ),
            TUPCID,
          ],
          (err, result) => {
            if (err) {
              console.error("Error updating admin data:", err);
              return res.status(500).send({ message: "Database error" });
            }
            return res
              .status(200)
              .send({ message: "admin updated successfully" });
          }
        );
      }
    })
    .catch((err) => {
      console.error("Error checking TUPCID in the database:", err);
      return res.status(500).send({ message: "Database error" });
    });
});

// Handle the login request
app.post("/login", async (req, res) => {
  const { TUPCID, PASSWORD } = req.body;

  try {
    const studentLoginResult = await checkLogin(
      "student",
      TUPCID,
      PASSWORD,
      "student"
    );
    const facultyLoginResult = await checkLogin(
      "faculty",
      TUPCID,
      PASSWORD,
      "faculty"
    );

    if (studentLoginResult.accountType === "student") {
      res.json({ accountType: "student" });
    } else if (facultyLoginResult.accountType === "faculty") {
      res.json({ accountType: "faculty" });
    } else {
      res.status(404).json({ message: "Account does not exist" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
});

app.post("/adminlogin", async (req, res) => {
  const { adminName, passWord } = req.body;

  try {
    const connect = await connection.getConnection();
    const [adminLogin] = await connect.execute(
      "SELECT * FROM admin_accounts WHERE ADMINNAME = ?",
      [adminName]
    );
    connect.release();

    if (adminLogin.length === 0) {
      return res.status(404).send({ isAuthenticated: false });
    }

    const storedHashedPassword = adminLogin[0].PASSWORD; // Fetch hashed password from database

    const passwordMatch = await bcryptjs.compare(
      passWord,
      storedHashedPassword
    );

    if (passwordMatch) {
      return res
        .status(200)
        .send({ isAuthenticated: true, adminName: adminLogin[0].ADMINNAME });
    } else {
      return res.status(401).send({ isAuthenticated: false });
    }
  } catch (err) {
    console.error("Error fetching admin account:", err);
    return res.status(500).send({ message: "Database error" });
  }
});

//passwordreset

/// Function to send the email to GSFE Account
const sendEmailToGSFEAccount = async (GSFEACC, code) => {
  // Replace these placeholders with your actual email service credentials and settings
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "eos2022to2023@gmail.com",
      pass: "ujfshqykrtepqlau",
    },
  });

  const mailOptions = {
    from: "eos2022to2023@gmail.com",
    to: GSFEACC,
    subject: "Forgot Password Code",
    text: `Good day! In order to update your password in the current account, please use the following 6-digit code: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to GSFE Account:", GSFEACC);
  } catch (err) {
    console.error("Error sending email to GSFE Account:", err);
    throw err;
  }
};

app.post("/forgotpassword", async (req, res) => {
  const { TUPCID, GSFEACC } = req.body;

  // Helper function to find the account type based on the TUPCID
  const findAccountType = async (TUPCID) => {
    try {
      const studentQuery =
        "SELECT TUPCID FROM student_accounts WHERE TUPCID = ?";
      const facultyQuery =
        "SELECT TUPCID FROM faculty_accounts WHERE TUPCID = ?";
      const adminQuery = "SELECT TUPCID FROM admin_accounts WHERE TUPCID = ?";

      const [studentRows] = await connection.query(studentQuery, [TUPCID]);
      const [facultyRows] = await connection.query(facultyQuery, [TUPCID]);
      const [adminRows] = await connection.query(adminQuery, [TUPCID]);

      if (studentRows.length > 0) {
        return "student";
      } else if (facultyRows.length > 0) {
        return "faculty";
      } else if (adminRows.length > 0) {
        return "admin";
      } else {
        return null; // Account type not found
      }
    } catch (error) {
      throw error;
    }
  };

  const generateAndSendCode = async (TUPCID, GSFEACC, accountType) => {
    // Add 'accountType' as a parameter
    try {
      // Generate a random 6-digit number between 100000 and 999999 (inclusive)
      const min = 100000;
      const max = 999999;
      const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);

      // Convert the random number to a 6-digit string by padding with leading zeros
      const code = randomNumber.toString().padStart(6, "0");

      // Store the code and accountType in the database along with TUPCID and GSFEACC
      const query =
        "INSERT INTO passwordreset_accounts (TUPCID, GSFEACC, code, accountType) VALUES (?, ?, ?, ?)"; // Include 'accountType' in the query
      await connection.query(query, [TUPCID, GSFEACC, code, accountType]); // Pass 'accountType' as a parameter

      // Send the code and account type to the registered GSFE account via email
      sendEmailToGSFEAccount(GSFEACC, code);

      // Send the response back to the client along with the account type
      return res.status(200).send({ message: "Code sent to GSFE Account" });
    } catch (err) {
      console.error("Error generating and sending code:", err);
      return res
        .status(500)
        .send({ message: "Failed to generate and send code" });
    }
  };

  try {
    // Check if TUPCID and GSFEACC are provided and not empty
    if (!TUPCID || !GSFEACC) {
      return res
        .status(400)
        .send({ message: "TUPCID and GSFEACC are required fields" });
    }

    // Check if the TUPCID exists in any account type table (student_accounts or faculty_accounts)
    const accountType = await findAccountType(TUPCID);
    if (!accountType) {
      return res.status(404).send({ message: "TUPCID does not exist" });
    }

    // Generate a random 6-digit number between 100000 and 999999 (inclusive)
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
    const code = randomNumber.toString().padStart(6, "0");

    // Store the code and accountType in the database along with TUPCID and GSFEACC
    const query =
      "INSERT INTO passwordreset_accounts (TUPCID, GSFEACC, code, accountType) VALUES (?, ?, ?, ?)";
    await connection.query(query, [TUPCID, GSFEACC, code, accountType]);

    // Send the code to the GSFE account via email
    await sendEmailToGSFEAccount(GSFEACC, code);

    // Send the response back to the client along with the account type
    return res.status(200).send({
      message:
        "A 6-digit code has been sent to the provided GSFE Account email address.",
      accountType,
    });
  } catch (err) {
    console.error("Error handling forgot password request:", err);
    return res.status(500).send({ message: "Failed to process the request" });
  }
});

//match coding...
// POST request to check if the inputted code matches the code received on the user's email
// Check if the inputted code matches the code received on the user's email
app.post("/matchcode", async (req, res) => {
  const { TUPCID, code } = req.body;

  try {
    // Check if the TUPCID exists in the passwordreset_accounts table
    const query = "SELECT * FROM passwordreset_accounts WHERE TUPCID = ?";
    const [rows] = await connection.query(query, [TUPCID]);

    // Check if there is a record for the provided TUPCID
    if (rows.length === 0) {
      return res.status(404).send({ message: "TUPCID not found" });
    }

    // Check if the inputted code matches the code stored in the database
    if (rows[0].code !== code) {
      return res.status(400).send({ message: "Invalid code" });
    }

    // If the code matches, remove the code from the database
    const deleteQuery = "DELETE FROM passwordreset_accounts WHERE TUPCID = ?";
    await connection.query(deleteQuery, [TUPCID]);

    // If the code matches and is removed, send a success response
    return res.status(200).send({ message: "Code matches" });
  } catch (err) {
    console.error("Error checking code in the database:", err);
    return res.status(500).send({ message: "Database error" });
  }
});

//getTUPCID IN FORGETPASSS..

app.get("/getTUPCID", async (req, res) => {
  const { code } = req.query;

  try {
    const query =
      "SELECT TUPCID, accountType FROM passwordreset_accounts WHERE code = ?";
    const [rows] = await connection.query(query, [code]);

    if (rows.length > 0) {
      const { TUPCID, accountType } = rows[0];
      return res.status(200).send({ TUPCID, accountType });
    } else {
      return res.status(404).send({ message: "Code not found" });
    }
  } catch (error) {
    console.error("Error fetching TUPCID:", error);
    return res.status(500).send({ message: "Failed to fetch TUPCID" });
  }
});

//get account type
// Endpoint for fetching the account type based on TUPCID
app.get("/getaccounttype", async (req, res) => {
  const { TUPCID } = req.query;

  try {
    const accountType = await findAccountType(TUPCID);
    if (!accountType) {
      return res
        .status(404)
        .send({ message: "Account type not found for the provided TUPCID" });
    }
    return res.status(200).send({ accountType });
  } catch (err) {
    console.error("Error fetching account type:", err);
    return res.status(500).send({ message: "Failed to fetch account type" });
  }
});

//update pass in forgot pass

// Helper function to update password for students and faculty
const updatePassword = async (table, TUPCID, PASSWORD) => {
  try {
    // Hash the new password before storing it in the database
    const hashedPassword = await bcryptjs.hash(PASSWORD, 10);

    const query = `UPDATE ${table}_accounts SET PASSWORD = ? WHERE TUPCID = ?`;
    await connection.query(query, [hashedPassword, TUPCID]);

    return { message: `${table} password updated successfully` };
  } catch (error) {
    throw error;
  }
};

app.put("/updatepassword/:TUPCID", async (req, res) => {
  const TUPCIDFromParams = req.params.TUPCID; // Get the TUPCID from the request params
  const { PASSWORD } = req.body;

  try {
    // Check if the TUPCID exists in either student_accounts or faculty_accounts table
    const accountType = await findAccountType(TUPCIDFromParams);
    if (accountType === "student") {
      await updatePassword("student", TUPCIDFromParams, PASSWORD);
    } else if (accountType === "faculty") {
      await updatePassword("faculty", TUPCIDFromParams, PASSWORD);
    } else if (accountType === "admin") {
      await updatePassword("admin", TUPCIDFromParams, PASSWORD);
    } else {
      return res.status(404).send({ message: "TUPCID not found" });
    }

    return res.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).send({ message: "Failed to update password" });
  }
});

//FIND ACCOUNT TYPE
const findAccountType = async (TUPCID) => {
  try {
    // Query the student_accounts table
    const [studentRows] = await connection.query(
      "SELECT TUPCID FROM student_accounts WHERE TUPCID = ?",
      [TUPCID]
    );

    if (studentRows.length > 0) {
      return "student";
    }

    // Query the faculty_accounts table
    const [facultyRows] = await connection.query(
      "SELECT TUPCID FROM faculty_accounts WHERE TUPCID = ?",
      [TUPCID]
    );

    if (facultyRows.length > 0) {
      return "faculty";
    }

    // Query the faculty_accounts table
    const [adminRows] = await connection.query(
      "SELECT TUPCID FROM admin_accounts WHERE TUPCID = ?",
      [TUPCID]
    );

    if (adminRows.length > 0) {
      return "admin";
    }
    // If no match is found in both tables, return null
    return null;
  } catch (error) {
    console.error("Error finding account type:", error);
    throw error;
  }
};

//getting account type
app.get("/getAccountType/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  try {
    const accountType = await findAccountType(TUPCID); // Implement the findAccountType function
    return res.status(200).send({ accountType });
  } catch (err) {
    console.error("Error finding account type:", err);
    return res.status(500).send({ message: "Failed to fetch account type" });
  }
});

//student info
app.get("/studinfo/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;

  try {
    const query =
      "SELECT FIRSTNAME, SURNAME, COURSE, YEAR FROM student_accounts WHERE TUPCID = ?";
    const [all] = await connection.query(query, [TUPCID]);

    if (all.length > 0) {
      const { FIRSTNAME, SURNAME, COURSE, YEAR } = all[0];
      console.log(FIRSTNAME, SURNAME, COURSE, YEAR);
      return res.status(202).send({ FIRSTNAME, SURNAME, COURSE, YEAR });
    } else {
      return res.status(404).send({ message: "Code not found" });
    }
  } catch (error) {
    console.error("Error fetching TUPCID:", error);
    return res.status(500).send({ message: "Failed to fetch TUPCID" });
  }
});
//update personal info student
app.get("/studinfos/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  try {
    const query = "SELECT * from student_accounts WHERE TUPCID = ?";
    const [getall] = await connection.query(query, [TUPCID]);
    if (getall.length > 0) {
      const {
        FIRSTNAME,
        SURNAME,
        MIDDLENAME,
        COURSE,
        SECTION,
        YEAR,
        STATUS,
        GSFEACC,
        PASSWORD,
      } = getall[0];
      return res
        .status(202)
        .send({
          FIRSTNAME,
          SURNAME,
          MIDDLENAME,
          COURSE,
          SECTION,
          YEAR,
          STATUS,
          GSFEACC,
          PASSWORD,
        });
    } else {
      return res.status(404).send({ message: "Student not found" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Failed to fetch TUPCID" });
  }
});

app.put("/updatestudentinfos/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  const updatedData = req.body;
  try {
    const datas = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(",");
    const query = `UPDATE student_accounts SET ${datas} WHERE TUPCID = ?`;
    connection.query(
      query,
      [...Object.values(updatedData), TUPCID],
      (err, result) => {
        if (err) {
          console.error("Error updating student data:", err);
          return res.status(500).send({ message: "Database error" });
        }
        return res
          .status(200)
          .send({ message: "Student updated successfully" });
      }
    );
  } catch (error) {
    console.log(error);
  }
});
//faculty info
app.get("/facultyinfo/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;

  try {
    const query =
      "SELECT FIRSTNAME, SURNAME, SUBJECTDEPT FROM faculty_accounts WHERE TUPCID = ?";
    const [all] = await connection.query(query, [TUPCID]);

    if (all.length > 0) {
      const { FIRSTNAME, SURNAME, SUBJECTDEPT } = all[0];
      return res.status(202).send({ FIRSTNAME, SURNAME, SUBJECTDEPT });
    } else {
      return res.status(404).send({ message: "Code not found" });
    }
  } catch (error) {
    console.error("Error fetching TUPCID:", error);
    return res.status(500).send({ message: "Failed to fetch TUPCID" });
  }
});
//update personal info faculty
app.get("/facultyinfos/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  try {
    const query = "SELECT * from faculty_accounts WHERE TUPCID = ?";
    const [getall] = await connection.query(query, [TUPCID]);
    if (getall.length > 0) {
      const { FIRSTNAME, SURNAME, MIDDLENAME, SUBJECTDEPT, GSFEACC, PASSWORD } =
        getall[0];
      return res
        .status(202)
        .send({
          FIRSTNAME,
          SURNAME,
          MIDDLENAME,
          SUBJECTDEPT,
          GSFEACC,
          PASSWORD,
        });
    } else {
      return res.status(404).send({ message: "Person not found" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Failed to fetch TUPCID" });
  }
});

app.put("/updatefacultyinfos/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  const updatedData = req.body;
  try {
    const datas = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(",");
    const query = `UPDATE faculty_accounts SET ${datas} WHERE TUPCID = ?`;
    connection.query(
      query,
      [...Object.values(updatedData), TUPCID],
      (err, result) => {
        if (err) {
          console.error("Error updating student data:", err);
          return res.status(500).send({ message: "Database error" });
        }
        return res
          .status(200)
          .send({ message: "Student updated successfully" });
      }
    );
  } catch (error) {
    console.log(error);
  }
});
//faculty add and delete class
//FACULTY ARCHIVE
// Endpoint to add a new class
app.post("/addclass", (req, res) => {
  const { TUPCID, class_code, class_name, subject_name } = req.body;
  checkingClass(class_code, subject_name)
  .then((count) => {
    if (count >= 1) {
      res.status(409).send({message: "Class Already Exists"})
    } else{
      const query = `INSERT INTO class_table (TUPCID, class_code, class_name, subject_name, created_at) VALUES (?,?, ?, ?, NOW())`;
      connection.query(
        query,
        [TUPCID, class_code, class_name, subject_name],
        (error, results) => {
          if (error) {
            console.error("Error adding class: ", error);
            res.status(500).send("Error adding class");
          } else {;
            res.status(200).send("Class added successfully");
          }
        }
      );
      }
  }).catch((error) => {
    console.log(error)
  })
});


// Import necessary modules and setup your server
//code validation for faculty

// Endpoint to delete a class by classCode
app.delete("/deleteclass/:tupcids/:class_name", (req, res) => {
  const { tupcids, class_name } = req.params;

  const query = "DELETE FROM class_table WHERE TUPCID = ? AND class_name = ?";
  connection.query(query, [tupcids,class_name], (error, results) => {
    if (error) {
      console.error("Error deleting class: ", error);
      res.status(500).send("Error deleting class");
    } else if (results.affectedRows === 0) {
      res.status(404).send("Class not found");
    } else {
      console.log("Class deleted successfully");
      res.status(200).send("Class deleted successfully");
    }
  });
});

// Endpoint to fetch all classes
// GET endpoint to fetch classes based on TUPCID
app.get("/classes/:tupcids", async (req, res) => {
  const { tupcids } = req.params;
  try {
    const query = "SELECT * FROM class_table WHERE TUPCID = ?";
    const [rows] = await connection.query(query, [tupcids]);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
});

//code validation for aclascode..

//code validation for aclascode..GET1
app.get("/checkclass/:classCode", async (req, res) => {
  const { classCode } = req.params;

  try {
    console.log("classcode findings: ", classCode);
    const query =
      "SELECT COUNT(*) AS count FROM class_table WHERE class_code = ?";
    const [rows] = await connection.query(query, [classCode]);

    const count = rows[0].count;
    console.log(count);
    if (count == 1) {
      res.status(200).json({ exists: true });
      console.log(true);
    } else {
      res.status(404).json({ exists: false, message: "Code not found" });
    }
  } catch (error) {
    console.error("Error fetching classCode:", error);
    res.status(500).json({ message: "Failed to fetch classCode" });
  }
});

//to get subject name
// Endpoint to get subject name based on class code
app.get("/getsubjectname/:classCode", async (req, res) => {
  const { classCode } = req.params;

  try {
    const query = "SELECT subject_name FROM class_table WHERE class_code = ?";
    const [rows] = await connection.query(query, [classCode]);

    if (rows.length === 1) {
      const subjectName = rows[0].subject_name;
      console.log("subjectname:", subjectName);
      res.status(200).json({ subject_name: subjectName });
    } else {
      res
        .status(404)
        .json({ message: "Subject not found for the given class code" });
    }
  } catch (error) {
    console.error("Error fetching subject name:", error);
    res.status(500).json({ message: "Failed to fetch subject name" });
  }
});

//post requesttt
// Endpoint to add a new class
app.post("/addclassstud", (req, res) => {
  const { TUPCID, class_code, subject_name } = req.body;

  const query = `INSERT INTO enrollments (TUPCID, class_code, subject_name, enrollment_date) VALUES (?, ?, ?, NOW())`;
  connection.query(
    query,
    [TUPCID, class_code, subject_name],
    (error, results) => {
      if (error) {
        console.error("Error adding class: ", error);
        res.status(500).send("Error adding class");
      } else {
        console.log("Class added successfully");
        res.status(201).send("Class added successfully");
      }
    }
  );
});

app.get("/getclasses/:tupcid", async (req, res) => {
  const { tupcid } = req.params;

  try {
    const query = "SELECT * FROM enrollments WHERE TUPCID = ?";
    const [rows] = await connection.query(query, [tupcid]);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
});

app.delete(
  "/deletestudentenrollment/:TUPCID/:subjectName",
  async (req, res) => {
    const { TUPCID, subjectName } = req.params;

    try {
      const deleteQuery = `
      DELETE FROM enrollments
      WHERE TUPCID = ? AND class_code IN (
        SELECT class_code FROM class_table WHERE subject_name = ?
      );
    `;

      await connection.query(deleteQuery, [TUPCID, subjectName]);

      res.status(200).json({ message: "Enrollment deleted successfully" });
    } catch (error) {
      console.error("Error deleting student enrollment:", error);
      res.status(500).json({ message: "Failed to delete student enrollment" });
    }
  }
);

//VIEWING STUDENTS ENROLLED IN SUBJECT
app.get("/getstudents/:classcode", async (req, res) => {
  const classcode = req.params.classcode;

  try {
    const connect = await connection.getConnection();

    const query = `
      SELECT e.TUPCID, s.FIRSTNAME, s.MIDDLENAME, s.SURNAME, s.STATUS,
             e.subject_name, e.enrollment_date
      FROM enrollments e
      INNER JOIN student_accounts s ON e.TUPCID = s.TUPCID
      WHERE e.class_code = ?;
    `;

    const students = await connect.execute(query, [classcode]);
    connect.release();

    return res.status(200).json({ students });
  } catch (err) {
    console.error("Error fetching students:", err);
    return res.status(500).json({ message: "Database error" });
  }
});

//getting the TUPCID OF PROFESSOR BASED ON CLASSNAME AND SUBJECTNAME
app.get("/getProfTUPCID/:subjectname/:classcode", async (req, res) => {
  const { subjectname, classcode } = req.params;

  try {
    const query =
      "SELECT TUPCID FROM class_table WHERE subject_name = ? and class_code = ?";
    const [tupcid] = await connection.query(query, [subjectname, classcode]);

    if (tupcid.length === 1) {
      const TUPCID = tupcid[0].TUPCID;
      res.status(200).json({ TUPCID });
    } else {
      res.status(404).json({ message: "WHat?" });
    }
  } catch (error) {
    console.error("Error fetching subject name:", error);
    res.status(500).json({ message: "Failed to fetch subject name" });
  }
});

app.get("/getProfName/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  try {
    const query =
      "SELECT FIRSTNAME, MIDDLENAME, SURNAME FROM faculty_accounts where TUPCID = ?";
    const [Name] = await connection.query(query, [TUPCID]);
    if (Name.length >= 1) {
      const { FIRSTNAME, MIDDLENAME, SURNAME } = Name[0];
      res.status(200).json({ FIRSTNAME, MIDDLENAME, SURNAME });
    } else {
      console.log("Error?");
    }
  } catch (error) {
    console.log(error);
  }
});


// Function to generate a 5-character code from a UUID
function generateCodeFromUUID() {
  const uuidValue = uuid.v4(); // Generate a random UUID
  const code = uuidValue.substring(0, 5).toUpperCase(); // Get the first 5 characters of the UUID and convert to uppercase
  return code;
}


// Endpoint to add a new test

// Adding a test and preset together
app.post('/addtestandpreset', async (req, res) => {
  const { TUPCID, class_name, subject_name, class_code, test_name, test_number, questions } = req.body;

  // Generate a unique code from the UUID for both test and preset
  const testCode = generateCodeFromUUID();

  const testQuery = `
    INSERT INTO testpapers 
    (uid, TUPCID, class_name, subject_name, class_code, test_name, test_number, questions, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

  const presetQuery = `
    INSERT INTO presets 
    (uid, TUPCID, class_name, subject_name, class_code, test_name, test_number, questions, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

  try {
    await connection.query(testQuery, [testCode, TUPCID, class_name, subject_name, class_code, test_name, test_number, JSON.stringify(questions)]);
    await connection.query(presetQuery, [testCode, TUPCID, class_name, subject_name, class_code, test_name, test_number, JSON.stringify(questions)]);

    console.log('Test and preset added successfully');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding test and preset:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



//get the test 
app.get("/gettestpaper/:tupcid/:classcode/:classname/:subjectname", async (req, res) => {
  const { tupcid, classcode, classname, subjectname } = req.params;

  try {
    const query = "SELECT * FROM testpapers WHERE TUPCID = ? AND class_code = ? AND class_name = ? AND subject_name = ?";
    const [rows] = await connection.query(query, [tupcid, classcode, classname, subjectname]);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching test papers:", error);
    res.status(500).json({ message: "Failed to fetch test papers" });
  }
});




//delete the test...

// Delete the test
app.delete("/deletetest/:testCode", (req, res) => {
  const { testCode } = req.params;

  const query = "DELETE FROM testpapers WHERE uid = ?";
  connection.query(query, [testCode], (error, results) => {
    if (error) {
      console.error("Error deleting test: ", error);
      res.status(500).send("Error deleting test");
    } else if (results.affectedRows === 0) {
      res.status(404).send("Test not found");
    } else {
      console.log("Test deleted successfully");
      res.status(200).send("Test deleted successfully");
    }
  });
});

// Update test
app.put("/updatetest/:testCode", (req, res) => {
  const { testCode } = req.params;
  const { testName, testNumber } = req.body;

  const updateQuery = `UPDATE testpapers SET test_name = ?, test_number = ? WHERE uid = ?`;

  connection.query(updateQuery, [testName, testNumber, testCode], (error, results) => {
    if (error) {
      console.error("Error updating test:", error);
      res.status(500).json({ success: false, error: "Error updating test" });
    } else {
      res.status(200).json({ success: true });
    }
  });
});


//presets

//get the test 
app.get("/getpresets/:tupcid", async (req, res) => {
  const { tupcid } = req.params;

  try {
    const query = "SELECT * FROM presets WHERE TUPCID = ? UNION SELECT * FROM testpapers WHERE TUPCID = ?";
    const [rows] = await connection.query(query, [tupcid, tupcid]);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching presets and test papers:", error);
    res.status(500).json({ message: "Failed to fetch presets and test papers" });
  }
});




//adding preset to current field..
app.get('/getPresetInfo/:uid/:tupcid', async (req, res) => {
  const { tupcid, uid } = req.params;

  console.log("uid...", uid);
  console.log("tupcid...", tupcid);

  try {
    // Construct the SQL query to retrieve information from both tables
    const query = `
      (SELECT TUPCID, uid, test_number, test_name, questions FROM presets WHERE TUPCID = ? AND uid = ?)
      UNION ALL
      (SELECT TUPCID, uid, test_number, test_name, questions FROM testpapers WHERE TUPCID = ? AND uid = ?)
    `;

    // Execute the query with the provided parameters
    const [presetInfo] = await connection.query(query, [tupcid, uid, tupcid, uid]);

    if (presetInfo.length >= 1) {
      res.status(200).json(presetInfo);
    } else {
      // No data found
      res.status(404).json({ error: 'No data found' });
    }
  } catch (error) {
    console.error('Error retrieving preset information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/addPresetToTest', async (req, res) => {
  try {
    const {
      TUPCID,
      class_name,
      subject_name,
      class_code,
      test_name,
      test_number,
      data,
    } = req.body;

    // Generate a new UID for the testpaper (you can use your logic here)
    const newUID = generateCodeFromUUID();
    console.log("TUPCID....", TUPCID);
    console.log("class_code...", class_code);

    // Insert a new record into the testpapers table
    const query = `
    INSERT INTO testpapers 
    (uid, TUPCID, class_name, subject_name, class_code, test_name, test_number, questions, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    
    `;

    const values = [
      newUID,
      TUPCID,
      class_name,
      subject_name,
      class_code,
      test_name,
      test_number,
      JSON.stringify(data),
    ];

    await connection.query(query, values);

    // Respond with a success message
    res.status(200).json({ message: 'Preset added to the test successfully' });
  } catch (error) {
    console.error('Error adding preset to the test:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




//check account existence in faculty...
// Check account existence in faculty...
app.get('/checkTUPCIDinFaculty', async (req, res) => {
  const { TUPCID } = req.query; // Use req.query to access query parameters

  try {
    // Check if TUPCID exists in faculty_accounts
    console.log("TUPC ID...", TUPCID);
    const exists = await checkTUPCIDExists(TUPCID, 'faculty_accounts');

    if (exists) {
      res.status(200).json({
        exists: true,
        message: 'TUPCID already exists in faculty_accounts.',
      });
    } else {
      res.status(200).json({
        exists: false,
        message: 'TUPCID does not exist in faculty_accounts.',
      });
    }
  } catch (error) {
    console.error('Error checking TUPCID in faculty_accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//for sharing
app.get('/getPresetInfo2/:uid', async (req, res) => {
  const { uid } = req.params;

  console.log("Received request for UID:", uid);

  try {
    // Construct the SQL query to retrieve information from both tables
    const query = `
      (SELECT uid, test_number, test_name, questions FROM presets WHERE uid = ?)
      UNION ALL
      (SELECT uid, test_number, test_name, questions FROM testpapers WHERE uid = ?)
    `;

    // Execute the query with the provided parameters
    const [presetInfo2] = await connection.query(query, [uid, uid]);

    if (presetInfo2.length >= 1) {
      console.log("Found preset for UID:", uid);
      res.status(200).json(presetInfo2[0]);
    } else {
      // Preset not found
      console.log("Preset not found for UID:", uid);
      res.status(404).json({ error: 'Preset not found' });
    }
  } catch (error) {
    console.error('Error retrieving preset information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//adding in test..
app.post('/sendToRecipient', async (req, res) => {
  try {
    const { TUPCID, class_code, class_name, subject_name, test_name, test_number, questions} = req.body;

    // Generate a new UID for the testpaper (you can use your logic here)
    const newUID = generateCodeFromUUID();
    console.log("tupcid....", TUPCID)
    console.log("classcode...", class_code)

    // Insert a new record into the testpapers table
    const query = `
      INSERT INTO testpapers 
      (uid, TUPCID, class_name, subject_name, class_code, test_name, test_number, questions, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      newUID,
      TUPCID,
      class_name,
      subject_name,
      class_code,
      test_name,
      test_number,
      JSON.stringify(questions),
    ];

    await connection.query(query, values);

    // Respond with a success message or appropriate response
    res.status(200).json({ message: 'Preset added to the test successfully' });
  } catch (error) {
    console.error('Error adding preset to the test:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//add test ready to print
app.post('/createtestpaper', async (req, res) => {
  try {
    // Access data from the request body
    const {
      TUPCID,
      test_number,
      test_name,
      class_name,
      class_code,
      subject_name,
      uid,
      data, // An array of objects representing questions
    } = req.body;
    console.log('Check receiving data....', TUPCID);

    // Insert data into the database
    const query = `
      INSERT INTO testforstudents 
      (TUPCID, test_number, test_name, class_name, class_code, subject_name, uid, questions, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      TUPCID,
      test_number,
      test_name,
      class_name,
      class_code,
      subject_name,
      uid,
      JSON.stringify(data), // Convert the array of question objects to JSON string
    ];

    await connection.query(query, values);

    // Respond with a success message
    res.status(200).json({ message: 'Data added to the test successfully' });
  } catch (error) {
    console.error('Error adding data to the test:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});





//get test data
app.get('/gettestdata/:uid', async (req, res) => {
  const { uid } = req.params;

  console.log("Received request for UID:", uid);

  try {
    // Construct the SQL query to retrieve information from both tables
    const query = `
      SELECT TUPCID, test_number, test_name, class_name, class_code, subject_name, uid, questions from testforstudents WHERE uid = ?
    `;

    // Execute the query with the provided parameters
    const [testdata] = await connection.query(query, [uid]);

    if (testdata.length >= 1) {
      console.log("Found test for UID:", uid);
      res.status(200).json(testdata[0]);
    } else {
      // Preset not found
      console.log("Test not found for UID:", uid);
      res.status(404).json({ error: 'test not found' });
    }
  } catch (error) {
    console.error('Error retrieving test information:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Update test
app.put("/updatetestpaper/:tupcid/:classcode/:uid", async (req, res) => {
  try {
    const { tupcid, classcode, uid } = req.params; // Extract parameters from URL
    const { data } = req.body; // An array of objects representing updated questions

    // Update the questions field in the database based on tupcid, classcode, and uid
    const updateQuery = `
      UPDATE testforstudents
      SET
        questions = ?,
        created_at = NOW() 
      WHERE TUPCID = ? AND class_code = ? AND uid = ?;
    `;

    const updateValues = [
      JSON.stringify(data), // Convert the array of question objects to JSON string
      tupcid,
      classcode,
      uid,
    ];

    await connection.query(updateQuery, updateValues);

    // Respond with a success message
    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});






//update data in preset and testpaper

app.put(
  "/updatetestpaperinpresetandtestpaper/:tupcids/:classcode/:testname/:testnumber",
  async (req, res) => {
    const {
      tupcids,
      classcode,
      testname,
      testnumber,
    } = req.params;

    const { data } = req.body;

    try {
      // Update data in the preset and testpaper tables based on the provided parameters
      const presetQuery = `
        UPDATE presets
        SET questions = ?
        WHERE TUPCID = ? AND class_code = ? AND test_name = ? AND test_number = ?
      `;

      const testpaperQuery = `
        UPDATE testpapers
        SET questions = ?
        WHERE TUPCID = ? AND class_code = ? AND test_name = ? AND test_number = ?
      `;

      const values = [
        JSON.stringify(data),
        tupcids,
        classcode,
        testname,
        testnumber,
      ];

      // Execute the queries
      await connection.query(presetQuery, values);
      await connection.query(testpaperQuery, values);

      // Respond with a success message
      res.status(200).json({ success: true, message: "Data updated successfully in preset_table and testpaper table." });
    } catch (error) {
      // Handle the error and respond with an error message
      console.error("Error updating data:", error);
      res.status(500).json({ success: false, error: "Internal Server Error", message: error.message });
    }
  }
);

app.get('/generateTestPaperpdf/:uid', async (req, res) => {
  try {
    const { uid } = req.params; // Extract parameters from URL

    // Fetch data from the database based on the parameters
    const query = `
      SELECT questions, test_number, test_name FROM testforstudents WHERE uid = ?;
    `;
    console.log("response....", uid);
    
    const [testdata] = await connection.query(query, [uid]);
    console.log("response....", testdata);
    // Extract the questions, test_number, and test_name from the database response
    const questionsData = testdata[0].questions;
    const test_number = testdata[0].test_number;
    const test_name = testdata[0].test_name;
   

    // Create a new PDF document
    const doc = new PDFDocument();
    const filename = `${test_number} : ${test_name}.pdf`;

    // Set the title based on TEST NUMBER and TEST NAME
    const title = doc.text(`${test_number} : ${test_name} UID:${uid}`, {
      bold: true,
      underline: true,
      fontSize: 24,
      align: 'center',
    });

    doc.moveDown();
    // Create an object to store questions grouped by questionType
    const groupedQuestions = {};

    // Group questions by questionType
    questionsData.forEach((item, index) => {
      const questionType = item.questionType;
      const question = item.question;
      const options = item.options;
      const score = item.score;

      // Check if both questionType and question are defined and not empty
      if (questionType && question) {
        if (!groupedQuestions[questionType]) {
          groupedQuestions[questionType] = [];
        }
        groupedQuestions[questionType].push({ question, options,score });
      }
    });

    // Create a counter to track the number of unique question types
    let testCounter = 1;

    // Iterate through the grouped questions and add them to the PDF document
    for (const questionType in groupedQuestions) {
      const questionsOfType = groupedQuestions[questionType];
      if (questionsOfType.length > 0) {
        // Convert the testCounter to a Roman numeral
        const romanNumeral = romanize(testCounter);

        // Determine the display text based on question type
        let displayText = '';
        let instructions = '';
        if (questionType === 'MultipleChoice') {
          displayText = 'Multiple Choice';
          instructions = 'Among the given OPTIONS in the questionnaire, choose the best option and write it in CAPITAL LETTER.';
        } else if (questionType === 'TrueFalse') {
          displayText = 'TRUE or FALSE';
          instructions = 'Write T if the statement is TRUE or F if the statement is FALSE.';
        } else if (questionType === 'Identification') {
          displayText = 'Identification';
          instructions = 'Write the ANSWER in CAPITAL LETTER.';
        }

        const score = questionsOfType[0].score;
        doc.moveDown();
        const questionTypeHeading = doc.text(`TEST ${romanNumeral}. ${displayText} (${score} pts. each)`, {
          bold: true,
          fontSize: 16,
          color: 'black',
        });
        
      

        // Add the instructions
        const instructionParagraph = doc.text(instructions, {
          fontSize: 12,
          color: 'black',
        });

        doc.moveDown();
        let questionNumber = 1; // Initialize question number

        questionsOfType.forEach((questionData, index) => {
          // Check if a new column should be started
          if (index > 0 && index % 10 === 0) {
            questionTypeHeading.addPage(); // Start a new page
          }

          const questionParagraph = doc.text(`${questionNumber}. ${questionData.question}`);
          doc.moveDown(0.5);

          // Add the question text or options as needed
          if (questionType === 'MultipleChoice') {
            if (questionData.options && questionData.options.length > 0) {
              const optionsText = questionData.options
                .map((option, optionIndex) => ` ${String.fromCharCode(97 + optionIndex)}.) ${option.text}\n`)
                .join(''); // Join options with a newline character
          
              doc.text(optionsText);
            }
            doc.moveDown(); 
          }
          

          questionNumber++; // Increment question number
          doc.moveDown();
        });

        testCounter++;
        doc.moveDown(); // Increment testCounter for the next type
      }
    }

    // Pipe the PDF to the response stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Finalize the PDF and end the response stream
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});


app.get('/generateTestPaperdoc/:uid', async (req, res) => {
  try {
    const { uid } = req.params; // Extract parameters from URL

    // Fetch data from the database based on the parameters
    const query = `
      SELECT questions, test_number, test_name FROM testforstudents WHERE uid = ?;
    `;

    const [testdata] = await connection.query(query, [uid]);

    // Extract the questions, test_number, and test_name from the database response
    const questionsData = testdata[0].questions;
    const test_number = testdata[0].test_number;
    const test_name = testdata[0].test_name;

    // Create a new Word document
    const docx = officegen('docx');
    const filename = `${test_number} : ${test_name}.docx`;

    // Define a function to add a paragraph with a specific style
    function addStyledParagraph(text, style) {
      const paragraph = docx.createP();
      paragraph.addText(text, style);
    }

    const title = `${test_number} : ${test_name} UID: ${uid}`;
  docx.createP().addText(title, {
  bold: true,
  fontSize: 16,
  color: 'black',
  
});

    // Create an object to store questions grouped by questionType
    const groupedQuestions = {};

    // Group questions by questionType
    questionsData.forEach((item) => {
      const questionType = item.questionType;
      const question = item.question;
      const options = item.options;
      const score = item.score;

      // Check if both questionType and question are defined and not empty
      if (questionType && question) {
        if (!groupedQuestions[questionType]) {
          groupedQuestions[questionType] = [];
        }
        groupedQuestions[questionType].push({ question, options, score });
      }
    });

    // Create a counter to track the number of unique question types
    let testCounter = 1;

    // Iterate through the grouped questions and add them to the Word document
    for (const questionType in groupedQuestions) {
      const questionsOfType = groupedQuestions[questionType];
      if (questionsOfType.length > 0) {
        // Convert the testCounter to a Roman numeral
        const romanNumeral = romanize(testCounter);

        // Determine the display text based on question type
        let displayText = '';
        let instructions = '';
        if (questionType === 'MultipleChoice') {
          displayText = 'Multiple Choice';
          instructions = 'Among the given OPTIONS in the questionnaire, choose the best option and write it in CAPITAL LETTER.';
        } else if (questionType === 'TrueFalse') {
          displayText = 'TRUE or FALSE';
          instructions = 'Write T if the statement is TRUE or F if the statement is FALSE.';
        } else if (questionType === 'Identification') {
          displayText = 'Identification';
          instructions = 'Write the ANSWER in CAPITAL LETTER.';
        }

        const score = questionsOfType[0].score;
        docx.createP().addText(`TEST ${romanNumeral}. ${displayText} (${score} pts. each)`, {
          bold: true,
          fontSize: 16,
          color: 'black',
        });

        addStyledParagraph(instructions, {
          fontSize: 12,
          color: 'black',
        });

        let questionNumber = 1; // Initialize question number

        questionsOfType.forEach((questionData, index) => {
          if (index > 0 && index % 10 === 0) {
            // Start a new page
            docx.createP().pageBreak();
          }

          addStyledParagraph(`${questionNumber}. ${questionData.question}`, {
            color: 'black',
          });

          // Add the question text or options as needed
          if (questionType === 'MultipleChoice') {
            if (questionData.options && questionData.options.length > 0) {
              questionData.options.forEach((option, optionIndex) => {
                addStyledParagraph(`  ${String.fromCharCode(97 + optionIndex)}.) ${option.text}`, {
                  color: 'black',
                });
              });
            }
          }

          questionNumber++; // Increment question number
        });

        testCounter++; // Increment testCounter for the next type
      }
    }

    // Pipe the Word document to the response stream for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    docx.generate(res);
  } catch (error) {
    console.error('Error generating Word document:', error);
    res.status(500).send('Error generating Word document');
  }
});


//for getting answersheet
app.get('/getquestionstypeandnumber/:tupcids/:uid', async (req, res) => {
  const { uid, tupcids } = req.params;

  console.log("uid:", uid);
  console.log("tupcid:", tupcids);

  try {
    // Construct the SQL query to retrieve the questions data
    const query = `
      SELECT questions
      FROM testforstudents
      WHERE TUPCID = ? AND uid = ?;
    `;

    // Execute the query with the provided parameters
    const [testdata] = await connection.query(query, [tupcids, uid]);

    if (testdata.length >= 1) {
      console.log("Found test data for UID:", uid);

      // Extract questions data from the response
      const questionsData = testdata[0].questions;

      // Extract questionNumber and questionType from questionsData
      const questionNumbers = questionsData.map((question) => question.questionNumber);
      const questionTypes = questionsData.map((question) => question.questionType);

      // Construct the response object with questionNumber and questionType
      const responseData = {
        questionNumbers,
        questionTypes,
      };

      res.status(200).json(responseData);
    } else {
      console.log("Test data not found for UID:", uid);
      res.status(404).json({ error: 'test data not found' });
    }
  } catch (error) {
    console.error('Error retrieving test data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
    
//generating answersheet
app.get('/generateAnswerSheet/:uid/:classcode', async (req, res) => {
  try {
    const { uid, classcode } = req.params; // Extract parameters from the URL

    // Fetch data from the database based on the parameters
    const query = `
      SELECT questions, test_number, test_name
      FROM testforstudents
      WHERE uid = ?;
    `;

    const query2 = `
      SELECT e.TUPCID, s.FIRSTNAME, s.MIDDLENAME, s.SURNAME
      FROM enrollments e
      INNER JOIN student_accounts s ON e.TUPCID = s.TUPCID
      WHERE e.class_code = ?;
    `;

    // Execute the first query to fetch data from 'testforstudents'
    const [testData] = await connection.query(query, [uid]);

    // Execute the second query to fetch data from 'enrollments' and 'student_accounts'
    const [studentData] = await connection.query(query2, [classcode]);

    const test_number = testData[0].test_number;
    const test_name = testData[0].test_name;

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'letter',
      margins: {
        top: 30,
        bottom: 10,
        left: 70,
        right: 20,
      }
    });
    const filename = `${test_number} : ${test_name}.pdf`;

    // Define the box size and spacing
    const boxSize = 15;
    const boxSpacing = 1;
    
    // Define the line weight for boxes
    const boxLineWeight = 0.50;
    doc.fontSize(10);

    const boxStrokeColor = '#818582';

    // Iterate through studentData and add each student's information and answer sheet
    for (const student of studentData) {
      // Extract student information
      const { TUPCID, FIRSTNAME, MIDDLENAME, SURNAME } = student;

      // Define column widths and spacing
      const columnWidth = 200;
      doc.lineWidth(5);

      // First rectangle information
      doc.rect(70, 10, columnWidth + 299, 100).stroke();
      doc.text(`${TUPCID}`, 90, 30, { width: columnWidth, align: 'left', bold: true });
      doc.text(`${SURNAME}, ${FIRSTNAME}`, 90, 50, { width: columnWidth, align: 'left', bold: true });
      doc.text(` ${test_number}:${test_name}  UID: ${uid}`, 190, 70, { width: columnWidth + 50, align: 'center', bold: true });

      const questionsData = testData[0].questions;
      const groupedQuestions = {};

      questionsData.forEach((item) => {
        const questionType = item.questionType;
        const type = item.type;

        if (questionType) {
          if (!groupedQuestions[questionType]) {
            groupedQuestions[questionType] = [];
          }
          groupedQuestions[questionType].push({ questionNumber: item.questionNumber, type: item.type });
        }
      });

      for (const questionType in groupedQuestions) {
        const questionsOfType = groupedQuestions[questionType];

        if (questionsOfType.length > 0) {
          // Determine the display text based on question type
          let displayText = ``;

          if (questionType === 'MultipleChoice') {
            displayText = 'MULTIPLE CHOICE';
          } else if (questionType === 'TrueFalse') {
            displayText = 'TRUE OR FALSE';
          } else if (questionType === 'Identification') {
            displayText = 'IDENTIFICATION';
          }

          // Determine the alignment based on the 'type'
          let alignment = 'left';
          if (questionsOfType[0].type === 'TYPE 2') {
            alignment = 'center';
          } else if (questionsOfType[0].type === 'TYPE 3') {
            alignment = 'right';
          }
         

          if (questionsOfType[0].type === 'TYPE 1' && questionType === 'MultipleChoice') {
            doc.rect(70, 140, columnWidth - 60, 600).stroke().strokeColor('black');
          } else if (questionsOfType[0].type === 'TYPE 1' && questionType === 'TrueFalse') {
            doc.rect(70, 140, columnWidth - 60, 600).stroke().strokeColor('black');
          } else if (questionsOfType[0].type === 'TYPE 1' && questionType === 'Identification') {
            doc.rect(70, 140, columnWidth - 40, 600).stroke().strokeColor('black');
          }

          if (questionsOfType[0].type === 'TYPE 2' && questionType === 'MultipleChoice') {
            doc.rect(70 + 172, 140, columnWidth - 60, 600).stroke().strokeColor('black');
          } else if (questionsOfType[0].type === 'TYPE 2' && questionType === 'TrueFalse') {
            doc.rect(70 + 172, 140, columnWidth - 60, 600).stroke().strokeColor('black');
          } else if (questionsOfType[0].type === 'TYPE 2' && questionType === 'Identification') {
            doc.rect(70 + 172, 140, columnWidth - 40, 600).stroke().strokeColor('black');
          }

          if (questionsOfType[0].type === 'TYPE 3' && questionType === 'MultipleChoice') {
            doc.rect(70 + 340, 140, columnWidth - 60, 600).stroke().strokeColor('black');
          } else if (questionsOfType[0].type === 'TYPE 3' && questionType === 'TrueFalse') {
            doc.rect(70 + 340, 140, columnWidth - 60, 600).stroke().strokeColor('black');
          } else if (questionsOfType[0].type === 'TYPE 3' && questionType === 'Identification') {
            doc.rect(70 + 340, 140, columnWidth - 40, 600).stroke().strokeColor('black');
          }

          doc.lineWidth(5); // Set the line thickness back to the default value (adjust as needed)

          doc.text(`${displayText}`, 90, 170, { width: columnWidth + 220, align: alignment });

          doc.moveDown(2);

          let questionNumber = 1; 
          questionsOfType.forEach(() => {
            if (questionNumber <= 9) {
              if (questionType === 'Identification') {
                doc.text(`${questionNumber}.  `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 150,
                  align: alignment,
                });
              } else if (questionType === 'TrueFalse') {
                doc.text(`${questionNumber}.   `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 155,
                  align: alignment,
                });
              } else {
                doc.text(`${questionNumber}.    `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 220,
                  align: alignment,
                });
              }
            }

            if (questionNumber >= 10) {
              if (questionType === 'Identification') {
                doc.text(`${questionNumber}.  `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 260,
                  align: alignment, 
                });
              } else if (questionType === 'TrueFalse') {
                doc.text(`${questionNumber}.   `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 200, // Customize the width
                  align: alignment, // Set alignment based on the 'type'
                });
              } else {
                doc.text(`${questionNumber}.   `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 220, // Customize the width
                  align: alignment, // Set alignment based on the 'type'
                });
              }
            }
           

            // BOXES
            if (questionType === 'MultipleChoice') {
              doc.rect(doc.x + 30 + boxSpacing, doc.y - 19.5, boxSize, boxSize)
                .lineWidth(boxLineWeight)
                .stroke('#adb8af')
                .strokeColor('black');
            } else if (questionType === 'Identification') {
              doc.rect(doc.x + 375, doc.y - 19.5, 90, boxSize)
                .lineWidth(boxLineWeight)
                .stroke('#adb8af')
                .strokeColor('black');
            } else if (questionType === 'TrueFalse') {
              doc.rect(doc.x + 200 + boxSpacing, doc.y - 19.5, boxSize, boxSize)
                .lineWidth(boxLineWeight)
                .stroke('#adb8af')
                .strokeColor('black');
            }
            doc.fill('black')
            doc.strokeColor('black');
            doc.moveDown(1.30);
            doc.lineWidth(5);
            questionNumber++;
          });
        }
      }
      doc.lineWidth(5);
      
      doc.moveDown(4);

      // Add a page break for the next student (except for the last one)
      if (student !== studentData[studentData.length - 1]) {
        doc.addPage();
      }
    }

    // Pipe the PDF to the response stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Finalize the PDF and end the response stream
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

  
//for answerkey
app.get('/getquestionstypeandnumberandanswer/:tupcids/:uid', async (req, res) => {
  const { uid, tupcids } = req.params;

  console.log("uid:", uid);
  console.log("tupcid:", tupcids);

  try {
    // Construct the SQL query to retrieve the questions data
    const query = `
      SELECT questions
      FROM testforstudents
      WHERE TUPCID = ? AND uid = ?;
    `;

    // Execute the query with the provided parameters
    const [testdata] = await connection.query(query, [tupcids, uid]);

    if (testdata.length >= 1) {
      console.log("Found test data for UID:", uid);

      // Extract questions data from the response
      const questionsData = testdata[0].questions;

      // Extract questionNumber, questionType, and answer from questionsData
      const questionNumbers = questionsData.map((question) => question.questionNumber);
      const questionTypes = questionsData.map((question) => question.questionType);
      const answers = questionsData.map((question) => question.answer);

      // Construct the response object with questionNumber, questionType, and answers
      const responseData = {
        questionNumbers,
        questionTypes,
        answers,
      };

      res.status(200).json(responseData);
    } else {
      console.log("Test data not found for UID:", uid);
      res.status(404).json({ error: 'test data not found' });
    }
  } catch (error) {
    console.error('Error retrieving test data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//for server
app.listen(3001, () => {
  console.log("Server started on port 3001");
});