import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Booth from "../components/Booth";
import Camera from "../components/Camera";

const Home = () => {
  const [start, setStart]=useState(false)
  return (
    <>
      <div className="p-6">
        <Header />

        {start ? <Camera /> : <Booth setStart={setStart} />}

        <Footer />
      </div>
    </>
  );
};

export default Home;
