const mongoose = require('mongoose');
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
const isValidTime = (s) => typeof s === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);
const toMinutes = (s) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};

const updateWorkSchedule = async (req, res) => {
  try {
    const { workSchedule } = req.body || {};
    if (!Array.isArray(workSchedule)) {
      return res.status(400).json({ message: "workSchedule חייב להיות מערך" });
    }

    const seen = new Set();
    const normalized = workSchedule
      .map((item) => {
        const dayOfWeek = Number(item.dayOfWeek);
        const isWorkDay = Boolean(item.isWorkDay);

        if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
          throw new Error("dayOfWeek חייב להיות בין 0 ל-6");
        }
        if (seen.has(dayOfWeek)) {
          throw new Error(`dayOfWeek מוכפל: ${dayOfWeek}`);
        }
        seen.add(dayOfWeek);

        let startHour = item.startHour ?? null;
        let endHour = item.endHour ?? null;

        if (isWorkDay) {
          if (!isValidTime(startHour)) throw new Error(`startHour לא תקין ליום ${dayOfWeek}`);
          if (!isValidTime(endHour)) throw new Error(`endHour לא תקין ליום ${dayOfWeek}`);
          if (toMinutes(endHour) <= toMinutes(startHour)) {
            throw new Error(`endHour חייב להיות גדול מ-startHour ליום ${dayOfWeek}`);
          }
        } else {
          // מציין במפורש שאין שעות ביום לא פעיל
          startHour = null;
          endHour = null;
        }

        return { dayOfWeek, startHour, endHour, isWorkDay };
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    // זהות יועץ מהמידלוור
    const consultantId =req.consultant?._id;
    if (!consultantId) return res.status(401).json({ message: "לא מזוהה" });

    // שלב שמירה עם save() כדי לקבל ולידציה מלאה של מסמך/תת-מסמכים
    const consultant = await Consultant.findById(consultantId).select("_id workSchedule");
    if (!consultant) return res.status(404).json({ message: "יועץ לא נמצא" });

    consultant.workSchedule = normalized;

    await consultant.save(); // יריץ ולידציות של הסכמה
    return res.status(200).json({ workSchedule: consultant.workSchedule });
  } catch (err) {
    console.error("updateWorkSchedule error:", err);
    const msg = err?.message || "שגיאת שרת";
    return res.status(400).json({ message: msg });
  }
};

// עדכון מערכת שעות ליועצת ספציפית (מפקחת בלבד)
const updateConsultantWorkSchedule = async (req, res) => {
  try {
    // ודא שהמשתמש הוא מפקחת
    if (req.consultant?.roles !== "Supervisor") {
      return res.status(403).json({ message: "Only Supervisor can update work schedule for other consultants" });
    }

    const { _id } = req.params; // מזהה היועצת
    const { workSchedule } = req.body || {};

    if (!mongoose.isValidObjectId(_id)) {
      return res.status(400).json({ message: "invalid consultant id" });
    }

    if (!Array.isArray(workSchedule)) {
      return res.status(400).json({ message: "workSchedule חייב להיות מערך" });
    }

    const seen = new Set();
    const normalized = workSchedule
      .map((item) => {
        const dayOfWeek = Number(item.dayOfWeek);
        const isWorkDay = Boolean(item.isWorkDay);

        if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
          throw new Error("dayOfWeek חייב להיות בין 0 ל-6");
        }
        if (seen.has(dayOfWeek)) {
          throw new Error(`dayOfWeek מוכפל: ${dayOfWeek}`);
        }
        seen.add(dayOfWeek);

        let startHour = item.startHour ?? null;
        let endHour = item.endHour ?? null;

        if (isWorkDay) {
          if (!isValidTime(startHour)) throw new Error(`startHour לא תקין ליום ${dayOfWeek}`);
          if (!isValidTime(endHour)) throw new Error(`endHour לא תקין ליום ${dayOfWeek}`);
          if (toMinutes(endHour) <= toMinutes(startHour)) {
            throw new Error(`endHour חייב להיות גדול מ-startHour ליום ${dayOfWeek}`);
          }
        } else {
          startHour = null;
          endHour = null;
        }

        return { dayOfWeek, startHour, endHour, isWorkDay };
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    const consultant = await Consultant.findById(_id).select("_id workSchedule");
    if (!consultant) return res.status(404).json({ message: "יועצת לא נמצאה" });

    consultant.workSchedule = normalized;
    await consultant.save();

    return res.status(200).json({ workSchedule: consultant.workSchedule });
  } catch (err) {
    console.error("updateConsultantWorkSchedule error:", err);
    const msg = err?.message || "שגיאת שרת";
    return res.status(400).json({ message: msg });
  }
};
// עדכון רשימת הגנים ליועצת
const updateConsultantKindergartens = async (req, res) => {
  try {
    const consultantId = req.consultant?._id;
    if (!consultantId) return res.status(401).json({ message: "לא מזוהה" });

    const { kindergartens } = req.body;
    if (!Array.isArray(kindergartens)) {
      return res.status(400).json({ message: "kindergartens חייב להיות מערך" });
    }

    // ולידציית ObjectId
    for (const id of kindergartens) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: `מזהה גן לא תקין: ${id}` });
      }
    }

    const consultant = await Consultant.findById(consultantId).select("_id kindergartens");
    if (!consultant) return res.status(404).json({ message: "יועצת לא נמצאה" });

    consultant.kindergartens = kindergartens;
    await consultant.save();

    const populated = await Consultant.findById(consultantId)
      .select("kindergartens")
      .populate({ path: "kindergartens", select: "_id institutionSymbol kindergartenTeacherName" });

    res.json({ kindergartens: populated.kindergartens });
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעדכון הגנים" });
  }
};
// קבלת היועצת הנוכחית לפי הטוקן
const getMe = async (req, res) => {
  try {
    const consultantId = req.consultant?._id;
    if (!consultantId) return res.status(401).json({ message: "לא מזוהה" });

    const consultant = await Consultant.findById(consultantId)
      .select("-password")
      .populate({
        path: "kindergartens",
        select: "_id institutionSymbol kindergartenTeacherName address phone age consultant"
      })
      .exec();

    if (!consultant) return res.status(404).json({ message: "יועצת לא נמצאה" });
    res.json(consultant);
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת" });
  }
};
// יצירת הערה ליועצת (מפקחת בלבד)
const addSupervisorNote = async (req, res) => {
  try {
    if (req.consultant?.roles !== "Supervisor") {
      return res.status(403).json({ message: "Only Supervisor can add notes" });
    }

    const { _id } = req.params; // consultant id
    const { text, pinned } = req.body || {};

    if (!mongoose.isValidObjectId(_id)) {
      return res.status(400).json({ message: "invalid consultant id" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const consultant = await Consultant.findById(_id).select("_id supervisorNotes");
    if (!consultant) return res.status(404).json({ message: "יועצת לא נמצאה" });

    consultant.supervisorNotes.push({
      author: req.consultant._id,
      text: text.trim(),
      pinned: Boolean(pinned),
    });

    await consultant.save();

    // הערה אחרונה שהתווספה
    const note = consultant.supervisorNotes[consultant.supervisorNotes.length - 1];
    return res.status(201).json({ note });
  } catch (err) {
    console.error("addSupervisorNote error:", err);
    return res.status(500).json({ message: "server error" });
  }
};

// קריאת כל ההערות – מפקחת או היועצת עצמה
const getSupervisorNotes = async (req, res) => {
  try {
    // קח את ה-id מהפרמטרים אם קיים, אחרת מהטוקן
    const consultantId = req.params._id || req.consultant?._id;
    if (!consultantId) return res.status(401).json({ message: "לא מזוהה" });

    // בדוק תקינות מזהה רק אם הגיע מהפרמטרים
    if (req.params._id && !mongoose.isValidObjectId(req.params._id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const consultant = await Consultant.findById(consultantId)
      .select("_id supervisorNotes")
      .populate({ path: "supervisorNotes.author", select: "firstName lastName email roles" });

    if (!consultant) return res.status(404).json({ message: "יועצת לא נמצאה" });

    const notes = (consultant.supervisorNotes || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ notes });
  } catch (err) {
    console.error("getSupervisorNotes error:", err);
    return res.status(500).json({ message: "server error" });
  }
};
// עדכון הערה – מפקחת בלבד
const updateSupervisorNote = async (req, res) => {
  try {
    if (req.consultant?.roles !== "Supervisor") {
      return res.status(403).json({ message: "Only Supervisor can update notes" });
    }

    const { _id, noteId } = req.params; // consultant id + note id
    const { text, pinned } = req.body || {};

    if (!mongoose.isValidObjectId(_id) || !mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const consultant = await Consultant.findById(_id).select("_id supervisorNotes");
    if (!consultant) return res.status(404).json({ message: "יועצת לא נמצאה" });

    const note = consultant.supervisorNotes.id(noteId);
    if (!note) return res.status(404).json({ message: "note not found" });

    if (typeof text === "string") note.text = text.trim();
    if (typeof pinned === "boolean") note.pinned = pinned;
    note.updatedAt = new Date();

    await consultant.save();
    return res.json({ note });
  } catch (err) {
    console.error("updateSupervisorNote error:", err);
    return res.status(500).json({ message: "server error" });
  }
};

// מחיקת הערה – מפקחת בלבד
const deleteSupervisorNote = async (req, res) => {
  try {
    if (req.consultant?.roles !== "Supervisor") {
      return res.status(403).json({ message: "Only Supervisor can delete notes" });
    }

    const { _id, noteId } = req.params;
    if (!mongoose.isValidObjectId(_id) || !mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const consultant = await Consultant.findById(_id).select("_id supervisorNotes");
    if (!consultant) return res.status(404).json({ message: "יועצת לא נמצאה" });

    const note = consultant.supervisorNotes.id(noteId);
    if (!note) return res.status(404).json({ message: "note not found" });

    note.deleteOne();
    await consultant.save();
    return res.json({ message: "deleted" });
  } catch (err) {
    console.error("deleteSupervisorNote error:", err);
    return res.status(500).json({ message: "server error" });
  }
};

module.exports = {
  getAllConsultant,
  addConsultant,
  getConsultantByID,
  updateConsultant,
  deleteConsultant,
  updateWorkSchedule ,
  updateConsultantWorkSchedule,
  updateConsultantKindergartens,
  getMe,
  addSupervisorNote,
  getSupervisorNotes,
  updateSupervisorNote,
  deleteSupervisorNote,
};
