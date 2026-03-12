import "./Walkthrough.css";
import { Walkthrough } from "./Walkthrough";
import { images, nodeConfigs } from "./walkthroughConfig";

function App() {
  return (
    <div className="wt-fullscreen">
      <Walkthrough images={images} nodeConfigs={nodeConfigs} />
    </div>
  );
}

export default App;

