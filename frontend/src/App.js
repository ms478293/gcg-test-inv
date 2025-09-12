import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

// Components
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import CollectionSection from "./components/CollectionSection";
import FeaturedProducts from "./components/FeaturedProducts";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <CollectionSection />
        <FeaturedProducts />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

// Collections Page Component
const Collections = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center mb-20">
            <h1 className="text-5xl lg:text-6xl font-light tracking-wider text-black mb-6">
              All Collections
            </h1>
            <div className="w-24 h-px bg-black mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Explore our complete range of luxury eyewear collections, from timeless classics to contemporary innovations.
            </p>
          </div>
          <CollectionSection />
          <FeaturedProducts />
        </div>
      </main>
      <Footer />
    </div>
  );
};

// About Page Component
const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <AboutSection />
          
          {/* Additional About Content */}
          <div className="py-24 bg-gray-50 mt-24 rounded-lg">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light tracking-wider text-black mb-6">
                Our Craftsmanship Process
              </h2>
              <div className="w-24 h-px bg-black mx-auto mb-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: "Design",
                  description: "Every frame begins with a sketch, inspired by Italian artistry and contemporary vision."
                },
                {
                  step: "02",
                  title: "Craft",
                  description: "Master artisans hand-shape each frame using traditional techniques passed down through generations."
                },
                {
                  step: "03",
                  title: "Perfect",
                  description: "Meticulous quality control ensures every piece meets our exacting standards before reaching you."
                }
              ].map((process, index) => (
                <div key={index} className="text-center">
                  <div className="text-6xl font-light text-gray-300 mb-4">
                    {process.step}
                  </div>
                  <h3 className="text-2xl font-medium text-black mb-4 tracking-wide">
                    {process.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    {process.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:slug" element={<Collections />} />
          <Route path="/about" element={<About />} />
          <Route index element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;