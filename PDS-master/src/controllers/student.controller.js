const db = require('../models');

const Student = db.student;

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.studentId);
    return res.json(student);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error retrieving student information' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    if (!req.body.school_name || !req.body.school_email) {
      return res
        .status(400)
        .json({ message: 'Provide a school_name and a school_email' });
    }
    const student = await Student.update(
      {
        school_name: req.body.school_name,
        school_email: req.body.school_email,
      },
      {
        where: {
          studentId: req.studentId,
        },
      }
    );

    return res.status(200).json(student);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Error updating student information' });
  }
};
