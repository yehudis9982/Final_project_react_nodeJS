# מערכת דוחות שבועיים מעודכנת

## שינויים שבוצעו

### מודל היועצת (Consultant)
נוספו שדות חדשים:
- `workSchedule`: מערך של לוח זמנים שבועי, כל יום כולל:
  - `dayOfWeek`: מספר היום בשבוע (0=ראשון, 6=שבת)
  - `startHour`: שעת התחלה לאותו יום
  - `endHour`: שעת סיום לאותו יום  
  - `isWorkDay`: האם זה יום עבודה

### יתרונות המבנה החדש:
- **שעות שונות לכל יום**: יועצת יכולה לעבוד 8:00-16:00 בראשון ו-9:00-15:00 בשני
- **גמישות מלאה**: תמיכה בחצי משרות, עבודה במשמרות
- **דיוק מרבי**: כל יום מתוכנן בנפרד

### מודל דוח שבועי (WeeklyReport)
השינוי המרכזי: במקום שדות פשוטים של גנים ומשימות, עכשיו יש:
- `weekStartDate`: תאריך תחילת השבוע
- `dailyWork`: מערך של ימי עבודה, כל יום כולל:
  - `date`: התאריך הספציפי
  - `dayOfWeek`: מספר היום בשבוע
  - `kindergartens`: מערך של ביקורים בגנים עם שעות ההתחלה והסיום
  - `tasks`: מערך של משימות עם שעות ההתחלה והסיום
  - `totalHours`: סה"כ שעות ביום
  - `notes`: הערות ליום
- `weeklyTotalHours`: סה"כ שעות בשבוע
- `status`: סטטוס הדוח (Draft, Submitted, Approved, Rejected)

## API החדש

### יועצות (Consultants)

#### הוספת יועצת עם לוח זמנים גמיש
```http
POST /api/consultant
Content-Type: application/json

{
  "firstName": "שרה",
  "lastName": "כהן",
  "email": "sarah@example.com",
  "password": "password123",
  "phone": "0501234567",
  "tz": "123456789",
  "workSchedule": [
    {
      "dayOfWeek": 0, // ראשון
      "startHour": "08:00",
      "endHour": "16:00", 
      "isWorkDay": true
    },
    {
      "dayOfWeek": 1, // שני
      "startHour": "09:00",
      "endHour": "15:00",
      "isWorkDay": true
    },
    {
      "dayOfWeek": 2, // שלישי
      "startHour": "08:30",
      "endHour": "16:30",
      "isWorkDay": true
    },
    {
      "dayOfWeek": 3, // רביעי
      "startHour": "08:00",
      "endHour": "14:00",
      "isWorkDay": true
    },
    {
      "dayOfWeek": 4, // חמישי
      "startHour": "10:00", 
      "endHour": "16:00",
      "isWorkDay": true
    },
    {
      "dayOfWeek": 5, // שישי
      "startHour": "08:00",
      "endHour": "12:00",
      "isWorkDay": false
    },
    {
      "dayOfWeek": 6, // שבת
      "startHour": "08:00",
      "endHour": "16:00",
      "isWorkDay": false
    }
  ]
}
```

#### קבלת לוח זמנים של יועצת
```http
GET /api/consultant/{id}/workdays
```

תשובה:
```json
{
  "consultantId": "consultant_id_here",
  "firstName": "שרה",
  "lastName": "כהן", 
  "workSchedule": [
    {
      "dayOfWeek": 0,
      "dayNameEnglish": "Sunday",
      "dayNameHebrew": "ראשון",
      "startHour": "08:00",
      "endHour": "16:00",
      "isWorkDay": true,
      "totalHours": 8
    },
    {
      "dayOfWeek": 1,
      "dayNameEnglish": "Monday", 
      "dayNameHebrew": "שני",
      "startHour": "09:00",
      "endHour": "15:00",
      "isWorkDay": true,
      "totalHours": 6
    }
  ],
  "totalWeeklyHours": 38,
  "workDays": [0, 1, 2, 3, 4]
}
```

### דוחות שבועיים (Weekly Reports)

#### יצירת תבנית דוח שבועי
```http
POST /api/weeklyReport/template
Content-Type: application/json

{
  "weekStartDate": "2024-01-07" // תאריך ראשון של השבוע
}
```

#### הוספת דוח שבועי מלא
```http
POST /api/weeklyReport
Content-Type: application/json

{
  "weekStartDate": "2024-01-07",
  "dailyWork": [
    {
      "date": "2024-01-07",
      "dayOfWeek": 0, // ראשון
      "kindergartens": [
        {
          "kindergarten": "kindergarten_id_here",
          "startTime": "08:00",
          "endTime": "12:00",
          "notes": "ביקור פיקוח"
        }
      ],
      "tasks": [
        {
          "task": {
            "title": "הכנת דוח",
            "description": "הכנת דוח חודשי"
          },
          "startTime": "12:00",
          "endTime": "14:00",
          "notes": "הושלם בהצלחה"
        }
      ],
      "totalHours": 6,
      "notes": "יום עמוס ופרודוקטיבי"
    }
  ],
  "generalNotes": "שבוע מוצלח"
}
```

#### עדכון יום עבודה ספציפי
```http
PUT /api/weeklyReport/{reportId}/daily/{dailyWorkId}
Content-Type: application/json

{
  "kindergartens": [...],
  "tasks": [...],
  "totalHours": 7,
  "notes": "הערות מעודכנות"
}
```

#### הוספת יום עבודה לדוח קיים
```http
POST /api/weeklyReport/{reportId}/daily
Content-Type: application/json

{
  "date": "2024-01-08",
  "dayOfWeek": 1,
  "kindergartens": [...],
  "tasks": [...],
  "totalHours": 8,
  "notes": "יום חדש"
}
```

#### קבלת סטטיסטיקות דוחות
```http
GET /api/weeklyReport/stats
```

## אבטחה והרשאות

1. **יועצים רגילים**: יכולים ליצור ולערוך רק את הדוחות שלהם, ורק בימי העבודה שלהם
2. **מפקחים (Supervisors)**: יכולים לראות ולערוך את כל הדוחות ולשנות השמות יועצים
3. **ימי עבודה**: המערכת מוודאת שניתן להוסיף דוחות רק לימי עבודה מוגדרים של היועצת

## דוגמאות שימוש

### תהליך טיפוסי ליצירת דוח שבועי:

1. **יצירת תבנית**: קרא ל-`POST /weeklyReport/template` עם תאריך תחילת השבוע
2. **מילוי פרטים**: עדכן כל יום עבודה עם ביקורים ומשימות
3. **הגשת דוח**: שנה את הסטטוס ל-"Submitted"
4. **אישור מפקח**: מפקח יכול לשנות סטטוס ל-"Approved" או "Rejected"

### דוגמה למבנה יום עבודה מלא עם תכנון מוקדם:
```json
{
  "date": "2024-01-07",
  "dayOfWeek": 0,
  "plannedStartHour": "08:00", // השעה המתוכננת להתחלה
  "plannedEndHour": "16:00",   // השעה המתוכננת לסיום
  "plannedHours": 8,           // סה"כ שעות מתוכננות
  "kindergartens": [
    {
      "kindergarten": "kindergarten_id_1",
      "startTime": "08:00",
      "endTime": "10:30",
      "notes": "פיקוח על הפעילות הבוקר"
    },
    {
      "kindergarten": "kindergarten_id_2", 
      "startTime": "11:00",
      "endTime": "13:00",
      "notes": "הדרכת צוות חינוכי"
    }
  ],
  "tasks": [
    {
      "task": {
        "title": "הכנת דוח איכות",
        "description": "דוח איכות לגן מספר 1"
      },
      "startTime": "13:30",
      "endTime": "15:30",
      "notes": "דוח הושלם ונשלח למפקח"
    }
  ],
  "totalHours": 7.5,           // שעות בפועל
  "notes": "יום פרודוקטיבי עם השלמת כל המשימות המתוכננות"
}
```

## הערות חשובות

1. **לוח זמנים גמיש**: כל יועצת יכולה להגדיר שעות עבודה שונות לכל יום
2. **דוגמאות לשימוש**:
   - יועצת שעובדת בבוקר בימים א'-ג' ובצהריים בימים ד'-ה'
   - יועצת שעובדת חצי משרה עם שעות שונות בכל יום
   - יועצת שעובדת במשמרות
3. **תכנון מול מימוש**: המערכת שומרת גם את השעות המתוכננות וגם את שעות העבודה בפועל
4. **חישוב אוטומטי**: המערכת מחשבת אוטומטית את סה"כ השעות השבועיות
5. **בקרת איכות**: אי אפשר ליצור דוחות לימים שאינם מוגדרים כימי עבודה
6. **גמישות מרבי**: ניתן לעדכן לוח זמנים בכל עת
7. **הערות מפורטות**: ברמת היום, הפעילות והשבוע
8. **מעקב הפרשי שעות**: השוואה בין שעות מתוכננות לשעות בפועל

## דוגמאות מקרי שימוש:

### יועצת במשרה חלקית:
```json
"workSchedule": [
  {"dayOfWeek": 0, "startHour": "08:00", "endHour": "12:00", "isWorkDay": true},
  {"dayOfWeek": 2, "startHour": "09:00", "endHour": "13:00", "isWorkDay": true},
  {"dayOfWeek": 4, "startHour": "08:30", "endHour": "12:30", "isWorkDay": true}
]
```

### יועצת עם שעות משתנות:
```json
"workSchedule": [
  {"dayOfWeek": 0, "startHour": "07:30", "endHour": "15:30", "isWorkDay": true},
  {"dayOfWeek": 1, "startHour": "09:00", "endHour": "17:00", "isWorkDay": true},
  {"dayOfWeek": 2, "startHour": "08:00", "endHour": "14:00", "isWorkDay": true},
  {"dayOfWeek": 3, "startHour": "10:00", "endHour": "18:00", "isWorkDay": true},
  {"dayOfWeek": 4, "startHour": "08:00", "endHour": "16:00", "isWorkDay": true}
]
```
