const Consultant = require('../models/Consultant');

// קבלת כל היועצות
const getAllConsultant = async (req, res) => {
  try {
    const consultants = await Consultant.find({}, { password: 0 }).sort({ _id: 1 });
    res.json(consultants);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בקבלת היועצות' });
  }
};

// הוספת יועצת
const addConsultant = async (req, res) => {
  const { firstName, lastName, email, password, phone, tz, workSchedule } = req.body;
  if (!firstName || !lastName || !email || !password || !phone || !tz) {
    return res.status(400).json({ message: 'חסרים נתונים נדרשים' });
  }
  if (await Consultant.findOne({ tz }).exec()) {
    return res.status(400).json({ message: 'ת.ז. חייבת להיות ייחודית' });
  }
  const consultant = await Consultant.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    tz,
    workSchedule: workSchedule || [
      { dayOfWeek: 0, startHour: '08:00', endHour: '16:00', isWorkDay: true },
      { dayOfWeek: 1, startHour: '08:00', endHour: '16:00', isWorkDay: true },
      { dayOfWeek: 2, startHour: '08:00', endHour: '16:00', isWorkDay: true },
      { dayOfWeek: 3, startHour: '08:00', endHour: '16:00', isWorkDay: true },
      { dayOfWeek: 4, startHour: '08:00', endHour: '16:00', isWorkDay: true },
      { dayOfWeek: 5, startHour: '08:00', endHour: '16:00', isWorkDay: false },
      { dayOfWeek: 6, startHour: '08:00', endHour: '16:00', isWorkDay: false }
    ]
  });
  res.json(consultant);
};

// קבלת יועצת לפי מזה
const getConsultantByID = async (req, res) => {
  const { _id } = req.params;
  const consultant = await Consultant.findById(_id, { password: 0 });
  if (!consultant) {
    return res.status(404).json({ message: 'יועצת לא נמצאה' });
  }
  res.json(consultant);
};

// עדכון יועצת
const updateConsultant = async (req, res) => {
  const { firstName, lastName, email, password, phone, tz, workSchedule } = req.body;
  const { _id } = req.params;
  const consultant = await Consultant.findById(_id);
  if (!consultant) {
    return res.status(404).json({ message: 'יועצת לא נמצאה' });
  }
  consultant.firstName = firstName;
  consultant.lastName = lastName;
  consultant.email = email;
  consultant.password = password;
  consultant.phone = phone;
  consultant.tz = tz;
  if (workSchedule) consultant.workSchedule = workSchedule;
  await consultant.save();
  res.json(consultant);
};

// מחיקת יועצת
const deleteConsultant = async (req, res) => {
  const { _id } = req.params;
  const consultant = await Consultant.findById(_id);
  if (!consultant) {
    return res.status(404).json({ message: 'יועצת לא נמצאה' });
  }
  await consultant.deleteOne();
  res.json({ message: `יועצת ${consultant.firstName} נמחקה` });
};

module.exports = {
  getAllConsultant,
  addConsultant,
  getConsultantByID,
  updateConsultant,
  deleteConsultant
};
