import React from "react";
import { Link } from "react-router";
import { Code, ChevronRight, BookOpen, Zap, AlignLeft, ArrowUpCircle } from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home = () => {
  const categories = [
    {
      id: "searching",
      title: "Searching Algorithms",
      description: "Explore efficient algorithms for searching through data structures.",
      color: "bg-gradient-to-br from-emerald-500 to-teal-700",
      hoverColor: "text-emerald-500",
      iconColor: "bg-emerald-500",
      icon: <Zap className="h-5 w-5" />,
      links: [
        { to: "/searching/algo1", label: "LinearSearch Visualizer" },
        { to: "/searching/algo2", label: "BinarySearch Visualizer" },
        { to: "/searching/algo3", label: "Search Algorithm Race" }
      ]
    },
    {
      id: "sorting",
      title: "Sorting Algorithms",
      description: "Learn how to organize data efficiently with various sorting techniques.",
      color: "bg-gradient-to-br from-violet-500 to-purple-700",
      hoverColor: "text-violet-500",
      iconColor: "bg-violet-500",
      icon: <AlignLeft className="h-5 w-5" />,
      links: [
        { to: "/sorting/algoA", label: "BubbleSort Visualizer" },
        { to: "/sorting/algoB", label: "InsertionSort Visualizer" },
        { to: "/sorting/algoC", label: "SelectionSort Visualizer" },
        { to: "/sorting/algoD", label: "MergeSort Visualizer" },
        { to: "/sorting/algoE", label: "QuickSort Visualizer" },
        { to: "/sorting/algoF", label: "Sorting Algorithm Race" }
      ]
    },
    {
      id: "backtracking",
      title: "Backtracking Algorithms",
      description: "Explore algorithms that systematically build solutions and backtrack when a dead end is reached.",
      color: "bg-gradient-to-br from-rose-500 to-red-700",
      hoverColor: "text-rose-500",
      iconColor: "bg-rose-500",
      icon: <BookOpen className="h-5 w-5" />,
      links: [
        { to: "/backtracking/algoX", label: "NQueens Visualizer" },
        { to: "/backtracking/algoY", label: "SudokuSolver Visualizer" }
      ]
    },
    {
      id: "graph",
      title: "Graph Algorithms",
      description: "Understand graph-based approaches for searching, shortest paths, and more.",
      color: "bg-gradient-to-br from-indigo-500 to-blue-700",
      hoverColor: "text-indigo-500",
      iconColor: "bg-indigo-500",
      icon: <Code className="h-5 w-5" />,
      links: [
        { to: "/graph/algo1", label: "BFS Visualizer" },
        { to: "/graph/algo2", label: "DFS Visualizer" },
        { to: "/graph/algo3", label: "Dijkstra Visualizer" },
        { to: "/graph/algo4", label: "PrimsAlgorithm Visualizer" },
        { to: "/graph/algo5", label: "KruskalsAlgorithm Visualizer" }
      ]
    },
    {
      id: "dp",
      title: "Dynamic Programming",
      description: "Solve complex problems by breaking them down into smaller subproblems and storing intermediate results.",
      color: "bg-gradient-to-br from-amber-500 to-yellow-600",
      hoverColor: "text-amber-500",
      iconColor: "bg-amber-500",
      icon: <Code className="h-5 w-5" />,
      links: [
        { to: "/dp/algo1", label: "Fibonacci Visualizer" }
      ]
    },
    {
      id: "tree",
      title: "Tree Algorithms",
      description: "Understand tree-based approaches for searching, sorting, and more.",
      color: "bg-gradient-to-br from-green-500 to-emerald-700",
      hoverColor: "text-green-500",
      iconColor: "bg-green-500",
      icon: <Code className="h-5 w-5" />,
      links: [
        { to: "/tree/algo1", label: "Tree Traversal Visualizer" },
        { to: "/tree/algo2", label: "BST Operations" }
      ]
    },
    {
      id: "greedy",
      title: "Greedy Algorithms",
      description: "Solve problems by making decisions based on local optima.",
      color: "bg-gradient-to-br from-red-500 to-rose-700",
      hoverColor: "text-red-500",
      iconColor: "bg-red-500",
      icon: <Code className="h-5 w-5" />,
      links: [
        { to: "/greedy/algo1", label: "HuffmanCoding Visualizer" }
      ]
    },
    {
      id: "math",
      title: "Mathematical Algorithms",
      description: "Discover efficient methods like Euclid's algorithm for GCD and prime factorization.",
      color: "bg-gradient-to-br from-blue-500 to-sky-700",
      hoverColor: "text-blue-500",
      iconColor: "bg-blue-500",
      icon: <Code className="h-5 w-5" />,
      links: [
        { to: "/math/algo1", label: "GCD Visualizer" }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Animated Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white shadow-md fixed top-0 left-0 z-50"
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div className="flex items-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <Code size={32} className="text-purple-800" />
            </motion.div>
            <Link to="/" className="ml-3 text-xl font-bold text-gray-800">
              DSA Visualizer
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Spacer to avoid navbar overlap */}
      <div className="pt-20"></div>

      {/* Hero Section with animated background */}
      <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-violet-700 to-indigo-800 animate-gradient-x">
          <div className="absolute inset-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern id="pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
              <Code size={48} className="text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-md"
          >
            DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-300">Visualizer</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-gray-100"
          >
            Dive into the world of Data Structures and Algorithms with interactive visualizations
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <a
              href="#categories"
              className="px-8 py-4 bg-white text-purple-800 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center transform hover:translate-y-1"
            >
              Explore Algorithms
              <ChevronRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        variants={fadeInUp}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Why Learn DSA?</h2>
            <div className="h-1 w-20 bg-purple-600 mx-auto rounded-full mb-8"></div>
            <p className="max-w-2xl mx-auto text-gray-600 text-lg">
              Data Structures and Algorithms (DSA) form the backbone of efficient problem solving in software development.
              Mastering DSA helps you optimize code performance, improve scalability, and tackle complex technical interviews
              with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              variants={fadeInUp} 
              className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Performance Optimization</h3>
              <p className="text-gray-600">Learn to write efficient code that scales with your application's needs.</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp} 
              className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Problem-Solving Skills</h3>
              <p className="text-gray-600">Develop a structured approach to dissecting and solving complex problems.</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp} 
              className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-pink-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Interview Preparation</h3>
              <p className="text-gray-600">Master the concepts commonly tested in technical interviews at top companies.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Algorithm Categories */}
      <main id="categories" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Algorithm Categories</h2>
            <div className="h-1 w-24 bg-purple-600 mx-auto rounded-full mb-6"></div>
            <p className="max-w-2xl mx-auto text-gray-600">
              Explore our comprehensive collection of algorithm visualizations across different categories.
              Each visualization offers interactive learning experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                variants={index % 3 === 0 ? fadeInLeft : (index % 3 === 2 ? fadeInRight : fadeInUp)}
                className="relative group"
              >
                <div className="absolute inset-0 rounded-2xl transform group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300 ease-in-out">
                  <div className={`w-full h-full rounded-2xl ${category.color} opacity-90`}></div>
                </div>
                
                <div className="relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 group-hover:border-transparent h-full flex flex-col">
                  <div className={`p-6 ${category.color} text-white`}>
                    <div className="flex items-center mb-2">
                      {category.icon}
                      <h3 className="text-xl font-bold ml-2">{category.title}</h3>
                    </div>
                    <p className="text-white/90 text-sm">{category.description}</p>
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <motion.ul 
                      variants={staggerChildren}
                      className="space-y-2"
                    >
                      {category.links.map((link, i) => (
                        <motion.li key={i} variants={fadeInUp}>
                          <Link
                            to={link.to}
                            className={`flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors group-hover:${category.hoverColor}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${category.iconColor} mr-3`}></span>
                            <span>{link.label}</span>
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Call to Action */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        variants={fadeInUp}
        className="py-16 bg-gradient-to-r from-purple-800 to-indigo-800 text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to master Data Structures & Algorithms?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-lg opacity-90">
            Join thousands of developers who have improved their problem-solving skills through our interactive visualizations.
          </p>
          <a href="#categories" className="px-8 py-4 bg-white text-purple-800 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center">
            Start Learning Now
            <ChevronRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </motion.section>

      {/* Improved Footer */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        variants={fadeInUp}
        className="bg-gray-900 text-white py-8 px-4"
      >
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white/10 p-2 rounded-full mr-3">
              <Code className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold">DSA Visualizer</span>
          </div>
          
          <div className="flex flex-col items-center">
            <p className="text-gray-300 italic mb-2">
              "Unlocking the power of Data Structures & Algorithms for innovative coding solutions."
            </p>
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} DSA Visualizer | Made by Nikhil Patil 😉| All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 z-50"
      >
        <ArrowUpCircle size={24} />
      </motion.button>
    </div>
  );
};

export default Home;
