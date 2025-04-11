import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontPath = path.join(__dirname, "../../Front-End");
router.use(express.static('public'));


router.get("/", (req, res) => {
  res.sendFile(`${frontPath}/index.html`);
});

router.get("/login", (req, res) => {
  
  res.sendFile(`${frontPath}/loginPage/loginandSignUp.html`);
   // this will render views/login.ejs
});

router.get("/login.html", (req, res) => {
  
  res.sendFile(`${frontPath}/loginPage/loginandSignUp.html`);
   // this will render views/login.ejs
});

router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    console.log(userId)
    if (!userId) {
      return res.redirect("/login"); // or res.status(401).send("Unauthorized")
    }

    const result = await db.query("SELECT * FROM courses ORDER BY created_at DESC");
    const courses = result.rows;

    res.render("Explore", {
      courses,
      userId,
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).send("Server Error");
  }
});


router.get("/mylearning", async (req, res) => {
  try {
    const userId = req.session?.user?.id;

    const enrolledCoursesQuery = await db.query(
      "SELECT course_id FROM user_courses WHERE user_id = $1",
      [userId]
    );

    const courseIds = enrolledCoursesQuery.rows.map(row => row.course_id);

    if (courseIds.length === 0) {
      return res.render("mylearning", { courses: [] });
    }

    const courseDetailsQuery = await db.query(
      `SELECT * FROM courses WHERE id = ANY($1)`,
      [courseIds]
    );

    const myCourses = courseDetailsQuery.rows;

    res.render("mylearning", { courses: myCourses });

  } catch (error) {
    console.error("Error fetching My Learning courses:", error.message);
    res.status(500).send("Server Error");
  }
});


router.get("/viewCourse", async (req, res) => {
  try {
    const course_id = req.query.courseId; // In production, get this from req.query.course_id or req.params

    // Step 1: Get course content
    const contentResult = await db.query(
      "SELECT content FROM course_contents WHERE course_id = $1",
      [course_id]
    );

    if (contentResult.rows.length === 0) {
      return res.status(404).send("Course content not found");
    }

    const courseContent = contentResult.rows[0].content;

    // Step 2: Get course details
    const courseResult = await db.query(
      "SELECT * FROM courses WHERE id = $1",
      [course_id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).send("Course not found");
    }

    const courseDetails = courseResult.rows[0];

    // Step 3: Format YouTube links to embeddable ones
    courseContent.sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        const videoUrl = lesson.video;

        if (videoUrl.includes("youtu.be")) {
          const videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
          lesson.video = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes("watch?v=")) {
          const videoId = videoUrl.split("watch?v=")[1].split("&")[0];
          lesson.video = `https://www.youtube.com/embed/${videoId}`;
        }
        // else keep the video as-is if already embedded
      });
    });

    // Optional debug logs
    console.log("✅ Course Content:", JSON.stringify(courseContent, null, 2));
    console.log("✅ Course Details:", JSON.stringify(courseDetails, null, 2));

    // Step 4: Render EJS template with content + details
    res.render("viewCourse", {
      courseContent,
      courseDetails,
    });

  } catch (error) {
    console.error("❌ Error in /viewCourse:", error.message);
    res.status(500).send("Server Error");
  }
});

// In your route file (e.g., pageroutes.js or app.js)
router.get('/course-creation', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('EnrollmentSteps', { userId: req.session.user.id }); // Pass userId
});


router.get('/AddCourseContent/CourseDashboard', async (req, res) => {
  console.log("Navigated to AddCourseContent Dashboard");

  try {
    const userId = req.session?.user?.id;
    if (!userId) return res.redirect('/login');

    const coursesResult = await db.query(
      'SELECT * FROM courses WHERE user_id = $1',
      [userId]
    );
    const courses = coursesResult.rows;

    const enrollStatsResult = await db.query(
      `SELECT 
         c.id, c.title, c.category, c.price, c.rating,
         COUNT(uc.id) AS enrollment_count
       FROM courses c
       LEFT JOIN user_courses uc ON c.id = uc.course_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY enrollment_count DESC`,
      [userId]
    );
    const enrollStats = enrollStatsResult.rows;

    let topCourse = null;
    if (enrollStats.length > 0) {
      const topCourseId = enrollStats
        .map(c => ({ id: c.id, score: c.enrollment_count * parseFloat(c.rating || 0) }))
        .sort((a, b) => b.score - a.score)[0].id;

      const topCourseResult = await db.query(
        'SELECT * FROM courses WHERE id = $1',
        [topCourseId]
      );
      topCourse = topCourseResult.rows[0];
    }

    res.render('CourseDashboard', {
      enrollStats,
      topCourse
    });

  } catch (err) {
    console.error("Error in /AddCourseContent/CourseDashboard:", err.message);
    res.status(500).send('Server Error');
  }
});



router.post('/create-course', async (req, res) => {
  try {
    const {
      userId,
      courseType,
      title,
      imageUrl,
      category,
      learnObjectives,
      requirements,
      whoIsThisFor,
      timeCommitment,
      instructorName,
      originalPrice,
      discountedPrice,
      rating,
      badges
    } = req.body;

    const result = await db.query(
      `INSERT INTO courses 
      (user_id, course_type, title, image_url, category, description, requirements, target_audience, time_commitment, instructor, original_price, price, rating, badges)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id`,
      [
        userId,
        courseType,
        title,
        imageUrl,
        category,
        learnObjectives,
        requirements,
        whoIsThisFor,
        timeCommitment,
        instructorName,
        originalPrice,
        discountedPrice,
        rating,
        badges
      ]
    );

    res.json({ success: true, courseId: result.rows[0].id, userId });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



router.get('/create-course-content/:userId/:courseId', (req, res) => {
  const { userId, courseId } = req.params;
  console.log(`Navigated to upload course content page for user: ${userId}, course: ${courseId}`);
  res.sendFile(`${frontPath}/AddCourseContent/CreateCourse.html`);

});


router.post("/create-course-content", async (req, res) => {
  const { userId, courseId, summary, sections } = req.body;
  console.log("from the post "+userId+" "+courseId);
  const content = {
    summary,
    sections
  };

  try {
    await db.query(
      `INSERT INTO course_contents (user_id, course_id, content) VALUES ($1, $2, $3)`,
      [userId, courseId, JSON.stringify(content)]
    );

    res.status(200).json({ success: true, message: "Course content saved successfully" });
  } catch (err) {
    console.error("Error inserting course content:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.post("/enroll", async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ error: "Missing userId or courseId" });
  }

  try {
    await db.query(
      `INSERT INTO user_courses (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [userId, courseId]
    );

    res.status(200).json({ message: "Enrolled successfully!" });
  } catch (err) {
    console.error("Error enrolling user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



export default router;
