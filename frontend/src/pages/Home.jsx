import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Booth from "../components/Booth";
import Camera from "../components/Camera";

const Home = () => {
  const [start, setStart] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-6 flex flex-col flex-1">
        <Header />
        {start
          ? <Camera onReset={() => setStart(false)} />
          : <Booth setStart={setStart} />
        }
        <Footer />
      </div>
    </div>
  );
};

export default Home;