import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Story from '../components/Story';
import Journey from '../components/Journey';
import Features from '../components/Features';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <Story />
        <Journey />
        <Features />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
};

export default Home;
