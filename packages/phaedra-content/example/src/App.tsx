import "quill/dist/quill.bubble.css";

import React from "react";
import { Content } from "phaedra-content";

const autoformat = {
  mention: {
    trigger: /[\s.,;:!?]/,
    find: /(?:^|\s)@[^\s.,;:!?]+/i,
    extract: /@([^\s.,;:!?]+)/i,
    transform: "$1",
    insert: "poll"
  }
};

const App = () => {
  return (
    <div>
      <Content
        // @ts-ignore
        autoformat={autoformat}
        onContentChange={(content) => console.log(content)}
      />
    </div>
  );
};

export default App;
