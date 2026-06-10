import "dotenv/config";
import { PrismaClient, Language, Difficulty } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.exerciseProgress.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create Python Basics course
  const pythonCourse = await prisma.course.create({
    data: {
      title: "Python Basics",
      description: "Learn the fundamentals of Python programming, from variables to functions.",
      slug: "python-basics",
      language: Language.PYTHON,
      order: 1,
      isPublished: true,
      lessons: {
        create: [
          {
            title: "Variables & Data Types",
            description: "Learn about Python variables, strings, numbers, and booleans.",
            videoUrl: "https://www.youtube.com/watch?v=example1",
            duration: 600,
            order: 1,
            exercises: {
              create: [
                {
                  title: "Hello Variable",
                  description: "Create a variable named 'greeting' with the value 'Hello, World!'",
                  starterCode: "# Create your variable here\n",
                  solution: "greeting = 'Hello, World!'\nprint(greeting)",
                  hints: ["Use the = operator to assign a value", "Strings need quotes around them"],
                  difficulty: Difficulty.EASY,
                },
                {
                  title: "Type Checker",
                  description: "Print the type of the value 42 using the type() function.",
                  starterCode: "value = 42\n# Print the type of value\n",
                  solution: "value = 42\nprint(type(value))",
                  hints: ["Use the type() function", "Pass the variable as an argument"],
                  difficulty: Difficulty.EASY,
                },
              ],
            },
          },
          {
            title: "Control Flow",
            description: "Master if-else statements and loops in Python.",
            videoUrl: "https://www.youtube.com/watch?v=example2",
            duration: 900,
            order: 2,
            exercises: {
              create: [
                {
                  title: "Even or Odd",
                  description: "Write a program that checks if a number is even or odd.",
                  starterCode: "num = 7\n# Check if num is even or odd\n",
                  solution: "num = 7\nif num % 2 == 0:\n    print('Even')\nelse:\n    print('Odd')",
                  hints: ["Use the modulo operator %", "If num % 2 == 0, it's even"],
                  difficulty: Difficulty.EASY,
                },
                {
                  title: "Countdown",
                  description: "Use a while loop to count down from 5 to 1.",
                  starterCode: "# Write a countdown from 5 to 1\n",
                  solution: "count = 5\nwhile count > 0:\n    print(count)\n    count -= 1",
                  hints: ["Start with count = 5", "Decrease count by 1 each iteration"],
                  difficulty: Difficulty.MEDIUM,
                },
              ],
            },
          },
          {
            title: "Functions & Modules",
            description: "Learn how to define functions and import modules.",
            videoUrl: "https://www.youtube.com/watch?v=example3",
            duration: 750,
            order: 3,
            exercises: {
              create: [
                {
                  title: "Greet Function",
                  description: "Define a function that takes a name and prints a greeting.",
                  starterCode: "# Define your greet function here\n",
                  solution: "def greet(name):\n    print(f'Hello, {name}!')",
                  hints: ["Use the def keyword", "Functions can take parameters"],
                  difficulty: Difficulty.MEDIUM,
                },
                {
                  title: "Math Module",
                  description: "Use the math module to calculate the square root of 144.",
                  starterCode: "import math\n# Calculate square root of 144\n",
                  solution: "import math\nresult = math.sqrt(144)\nprint(result)",
                  hints: ["Import math at the top", "Use math.sqrt()"],
                  difficulty: Difficulty.EASY,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create AI Fundamentals course
  const aiCourse = await prisma.course.create({
    data: {
      title: "AI Fundamentals",
      description: "Explore the basics of artificial intelligence and machine learning concepts.",
      slug: "ai-fundamentals",
      language: Language.AI_BASICS,
      order: 2,
      isPublished: true,
      lessons: {
        create: [
          {
            title: "What is AI?",
            description: "Understand the history and types of artificial intelligence.",
            videoUrl: "https://www.youtube.com/watch?v=example4",
            duration: 480,
            order: 1,
            exercises: {
              create: [
                {
                  title: "AI Categories",
                  description: "List the three main categories of AI.",
                  starterCode: "# Write your answer as comments\n",
                  solution: "# 1. Narrow AI (Weak AI)\n# 2. General AI (Strong AI)\n# 3. Superintelligent AI",
                  hints: ["Think about what Siri and Alexa use", "Consider human-level vs specialized intelligence"],
                  difficulty: Difficulty.EASY,
                },
                {
                  title: "Turing Test",
                  description: "Explain what the Turing Test measures in your own words.",
                  starterCode: "# Write your explanation here\n",
                  solution: "# The Turing Test measures a machine's ability to exhibit intelligent behavior equivalent to a human.",
                  hints: ["It was proposed by Alan Turing", "It involves a human evaluator"],
                  difficulty: Difficulty.EASY,
                },
              ],
            },
          },
          {
            title: "Machine Learning Basics",
            description: "Learn about supervised, unsupervised, and reinforcement learning.",
            videoUrl: "https://www.youtube.com/watch?v=example5",
            duration: 1200,
            order: 2,
            exercises: {
              create: [
                {
                  title: "Learning Types",
                  description: "Match each ML type with its description.",
                  starterCode: "# Write the correct type next to each description\n",
                  solution: "# Labeled data -> Supervised Learning\n# No labels -> Unsupervised Learning\n# Rewards -> Reinforcement Learning",
                  hints: ["Supervised uses labeled data", "Unsupervised finds patterns", "Reinforcement uses rewards"],
                  difficulty: Difficulty.MEDIUM,
                },
                {
                  title: "Training Data",
                  description: "Explain why we split data into training and testing sets.",
                  starterCode: "# Write your explanation in comments\n",
                  solution: "# We split data to evaluate how well the model generalizes to unseen data and avoid overfitting.",
                  hints: ["Think about avoiding overfitting", "The test set simulates real-world data"],
                  difficulty: Difficulty.HARD,
                },
              ],
            },
          },
          {
            title: "Neural Networks Overview",
            description: "Understand the structure and function of neural networks.",
            videoUrl: "https://www.youtube.com/watch?v=example6",
            duration: 1500,
            order: 3,
            exercises: {
              create: [
                {
                  title: "Network Layers",
                  description: "Name the three types of layers in a neural network.",
                  starterCode: "# List the three layer types\n",
                  solution: "# 1. Input Layer\n# 2. Hidden Layer(s)\n# 3. Output Layer",
                  hints: ["The first layer receives the data", "The last layer produces the result", "Middle layers do the processing"],
                  difficulty: Difficulty.EASY,
                },
                {
                  title: "Activation Functions",
                  description: "Explain why activation functions are important in neural networks.",
                  starterCode: "# Write your explanation\n",
                  solution: "# Activation functions introduce non-linearity, allowing the network to learn complex patterns.",
                  hints: ["Without them, the network is just linear regression", "They enable learning complex functions"],
                  difficulty: Difficulty.HARD,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed completed successfully!");
  console.log(`Created courses: ${pythonCourse.title}, ${aiCourse.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
