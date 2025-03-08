import React from "react";
import { Link } from "react-router";
import { Code, Link2Icon, Link2 } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const zoomIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
};

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                variants={fadeInUp}
                className="relative w-full h-[50vh] bg-gradient-to-r from-purple-600 to-violet-700 flex items-center justify-center"
            >
                <div className="relative text-center text-white z-10 px-4">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center mb-3"
                    >
                        <Code size={40} />
                    </motion.div>
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold mb-4"
                        variants={fadeInUp}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        DSA Visualizer
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl max-w-xl mx-auto mb-6"
                        variants={fadeInUp}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        Dive into the world of Data Structures and Algorithms with interactive visualizations.
                    </motion.p>
                </div>
            </motion.section>

            {/* Introduction / Info Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                variants={fadeInUp}
                className="container mx-auto px-4 py-8 text-center"
            >
                <h2 className="text-2xl font-semibold mb-4">Why Learn DSA?</h2>
                <p className="max-w-2xl mx-auto text-gray-700">
                    Data Structures and Algorithms (DSA) form the backbone of efficient problem solving in software development.
                    Mastering DSA helps you optimize code performance, improve scalability, and tackle complex technical interviews
                    with confidence.
                </p>
            </motion.div>

            {/* Main Content: Algorithm Categories */}
            <main className="flex-grow container mx-auto px-4 pb-8">
                <motion.h2
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    variants={fadeInUp}
                    className="text-2xl font-semibold mb-6 text-center"
                >
                    Algorithm Categories
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Searching Algos */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        variants={zoomIn}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-transform duration-300 border border-gray-100 hover:scale-105"
                    >
                        <h3 className="text-xl font-bold mb-2 text-green-600">Searching Algos</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Explore efficient algorithms for searching through data structures.
                        </p>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/searching/algo1"
                                    className="text-gray-700 hover:text-green-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Searching Algo A
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/searching/algoB"
                                    className="text-gray-700 hover:text-green-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Searching Algo B
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/searching/algoC"
                                    className="text-gray-700 hover:text-green-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Searching Algo C
                                </Link>
                            </li>
                        </ul>
                    </motion.div>


                    {/* Sorting Algos */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        variants={zoomIn}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-transform duration-300 border border-gray-100 hover:scale-105"
                    >
                        <h3 className="text-xl font-bold mb-2 text-purple-600">Sorting Algos</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Learn how to organize data efficiently with various sorting techniques.
                        </p>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/sorting/algoA"
                                    className="text-gray-700 hover:text-purple-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                    Sorting Algo A
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/sorting/algoB"
                                    className="text-gray-700 hover:text-purple-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                    Sorting Algo B
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/sorting/algoC"
                                    className="text-gray-700 hover:text-purple-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                    Sorting Algo C
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Backtracking Algos */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        variants={zoomIn}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-transform duration-300 border border-gray-100 hover:scale-105"
                    >
                        <h3 className="text-xl font-bold mb-2 text-red-600">Backtracking Algos</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Explore algorithms that systematically build solutions and backtrack when a dead end is reached.
                        </p>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/backtracking/algoX"
                                    className="text-gray-700 hover:text-red-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    Backtracking Algo X
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/backtracking/algoY"
                                    className="text-gray-700 hover:text-red-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    Backtracking Algo Y
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/backtracking/algoZ"
                                    className="text-gray-700 hover:text-red-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    Backtracking Algo Z
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Graph Algos */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        variants={zoomIn}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-transform duration-300 border border-gray-100 hover:scale-105"
                    >
                        <h3 className="text-xl font-bold mb-2 text-violet-600">Graph Algos</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Understand graph-based approaches for searching, shortest paths, and more.
                        </p>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/graph/algo1"
                                    className="text-gray-700 hover:text-violet-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                                    Graph Algo 1
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/graph/algo2"
                                    className="text-gray-700 hover:text-violet-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                                    Graph Algo 2
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/graph/algo3"
                                    className="text-gray-700 hover:text-violet-500 transition-colors flex items-center"
                                >
                                    <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                                    Graph Algo 3
                                </Link>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <motion.footer
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                variants={fadeInUp}
                className="bg-purple-900 text-white py-4 px-4"
            >
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-2 md:mb-0">
                        <Code className="h-5 w-5 mr-2" />
                        <span className="font-semibold">DSA Visualizer</span>
                    </div>
                    <p>&copy; {new Date().getFullYear()} DSA Visualizer. All rights reserved.</p>
                </div>
            </motion.footer>
        </div>
    );
};

export default Home;
