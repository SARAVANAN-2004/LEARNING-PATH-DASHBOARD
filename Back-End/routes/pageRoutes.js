import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontPath = path.join(__dirname, "../../Front-End");

const courses = [
    {
      title: "Ultimate AWS Certified Solutions Architect Associate 2025",
      instructor: "Stephane Maarek",
      rating: "⭐ 4.7 (252,564 reviews)",
      price: "₹549",
      originalPrice: "₹3,499",
      badges: ["Premium", "Bestseller"],
      image: "https://img-c.udemycdn.com/course/240x135/2196488_8fc7_10.jpg"
    },
    {
      title: "Python for Data Science and Machine Learning Bootcamp",
      instructor: "Jose Portilla",
      rating: "⭐ 4.6 (200,432 reviews)",
      price: "₹699",
      originalPrice: "₹3,999",
      badges: ["Premium"],
      image: "https://img-c.udemycdn.com/course/240x135/567828_67d0.jpg"

    },
    {
      title: "React - The Complete Guide (2025 Edition)",
      instructor: "Maximilian Schwarzmüller",
      rating: "⭐ 4.8 (182,342 reviews)",
      price: "₹799",
      originalPrice: "₹4,499",
      badges: ["Bestseller"],
      image: "https://img-c.udemycdn.com/course/240x135/1565838_e54e_16.jpg"

    }
  ];

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

router.get("/dashboard", (req, res) => {
    res.render("Explore", { courses });
  });

router.get("/mylearning", (req, res) => {
    res.render("mylearning", { courses: myCourses });
});

router.get('/viewCourse', (req, res) => {
    res.render('viewCourse', { courseContent });
});
  

export default router;
