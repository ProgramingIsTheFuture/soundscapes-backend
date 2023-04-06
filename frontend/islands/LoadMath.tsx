import { useEffect } from "preact/hooks";

export default function LoadMath() {
  useEffect(() => {
    (window as any).MathJax = {
      tex: {
        inlineMath: [["$", "$"], ["\\(", "\\)"]],
      },
      svg: {
        fontCache: "global",
      },
    };
    localStorage.setItem("he", "hehehehehee");
    (function () {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
      script.async = true;
      document.head.appendChild(script);
    })();
  }, [window]);
  return (
    <div>
    </div>
  );
}
