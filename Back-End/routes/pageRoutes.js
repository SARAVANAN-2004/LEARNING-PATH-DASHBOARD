import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../config/db.js";
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontPath = path.join(__dirname, "../../Front-End");
router.use(express.static('public'));



const myCourses = [
    {
      title: "Mathematics for Machine Learning",
      instructor: "Imperial College London",
      rating: "4.7",
      reviews: "52,564",
      price: "₹549",
      originalPrice: "₹3,499",
      premium: true,
      bestseller: true,
      image: "https://th.bing.com/th/id/OIP.5W7SoEe8_fvu_o-USMvp7QHaE_?rs=1&pid=ImgDetMain"
    },
    {
      title: "SQL Masterclass: Learn SQL for Data Science",
      instructor: "Jose Portilla",
      rating: "4.7",
      reviews: "35,452",
      price: "₹699",
      originalPrice: "₹3,999",
      premium: true,
      bestseller: false,
      image: "https://s3.amazonaws.com/freecodecamp/news-sql-full-course.jpg"
    },
    {
      title: "Microsoft Power BI - Data Analytics Essentials",
      instructor: "Kirill Eremenko",
      rating: "4.8",
      reviews: "42,865",
      price: "₹799",
      originalPrice: "₹4,499",
      premium: false,
      bestseller: true,
      image: "https://th.bing.com/th/id/OIP.nYNpnca4xSfnEsLF4wE6DgHaF9?rs=1&pid=ImgDetMain"
    }
  ];

const courseContent = {
title: "Advanced Algebra",
description: "Master Algebra with step-by-step video tutorials and practice problems.",
overview: "This course covers all essential algebra topics, from basic equations to real-world applications.",
sections: [
    {
    title: "Section 1: Basics of Algebra",
    lessons: [
        { title: "Lesson 1: Introduction", videoId: "5-k2FJHDFoQ" },
        { title: "Lesson 2: Solving Equations", videoId: "kM9ASKAnmP8" },
        { title: "Lesson 3: Quadratic Functions", videoId: "aJbJxGJqF_E" }
    ]
    },
    {
    title: "Section 2: Advanced Topics",
    lessons: [
        { title: "Lesson 4: Polynomials", videoId: "YcUbk60PSjU" },
        { title: "Lesson 5: Logarithms", videoId: "sXN-m48ErD8" },
        { title: "Lesson 6: Matrices", videoId: "frVco3fX_l4" }
    ]
    },
    {
    title: "Section 3: Real-World Applications",
    lessons: [
        { title: "Lesson 7: Algebra in Physics", videoId: "e0bnUlSOnbU" },
        { title: "Lesson 8: Algebra in Finance", videoId: "ylKx2BojXNc" },
        { title: "Lesson 9: Data Science & Algebra", videoId: "Z1Yd7upQsXY" }
    ]
    },
]
};

router.get("/", (req, res) => {
  res.sendFile(`${frontPath}/index.html`);
});

router.get("/dashboard", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM courses ORDER BY created_at DESC");
    const courses = result.rows;

    res.render("Explore", { courses }); // Pass the data to your EJS page
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/mylearning", async (req, res) => {
  try {
    const userId = 1; // Replace with req.user.id if using authentication

    // Step 1: Get the list of enrolled course IDs
    const enrolledCoursesQuery = await db.query(
      "SELECT course_id FROM user_courses WHERE user_id = $1",
      [userId]
    );

    const courseIds = enrolledCoursesQuery.rows.map(row => row.course_id);

    // If no courses found, render empty view
    if (courseIds.length === 0) {
      return res.render("mylearning", { courses: [] });
    }

    // Step 2: Fetch full course details using course IDs
    const courseDetailsQuery = await db.query(
      `SELECT * FROM courses WHERE id = ANY($1)`,
      [courseIds]
    );

    const myCourses = courseDetailsQuery.rows;

    // Step 3: Render EJS view with course details
    res.render("mylearning", { courses: myCourses });

  } catch (error) {
    console.error("Error fetching My Learning courses:", error.message);
    res.status(500).send("Server Error");
  }
});

router.get('/viewCourse', (req, res) => {
    res.render('viewCourse', { courseContent });
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


export default router;
