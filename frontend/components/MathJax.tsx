import { ComponentChildren } from "preact";

const MathJax = (props: { children: ComponentChildren }) => {
  return (
    <div className={"mathjax"}>
      {props.children}
    </div>
  );
};

export default MathJax;
